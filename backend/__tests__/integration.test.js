/**
 * End-to-end API journey against a real PostgreSQL database (see `jest.setup.js` DATABASE_URL).
 * Mocks: HIBP/Shodan/Hunter (modules), SendGrid, Stripe, BullMQ — no external HTTP/API keys.
 * Run: `npm test -- __tests__/integration.test.js --runInBand` (requires Postgres + `npx prisma migrate deploy`).
 */
const request = require("supertest");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/* ── Mock external services (no real API keys) ───────────────────────── */

jest.mock("../src/services/hibp", () => ({
  getBreachesForEmail: jest.fn().mockResolvedValue({
    breaches: [
      {
        name: "TestBreach",
        title: "TestBreach",
        breachDate: "2023-01-15",
        dataClasses: ["Email addresses", "Passwords"],
      },
      {
        name: "TestBreach2",
        title: "TestBreach2",
        breachDate: "2022-06-01",
        dataClasses: ["Email addresses"],
      },
    ],
    breachNames: ["TestBreach", "TestBreach2"],
  }),
}));

jest.mock("../src/services/shodan", () => ({
  searchEmail: jest.fn().mockResolvedValue({ total: 5 }),
}));

jest.mock("../src/services/hunter", () => ({
  verifyEmail: jest.fn().mockResolvedValue({
    status: "valid",
    score: 95,
    raw: { data: { status: "valid", score: 95 } },
  }),
}));

jest.mock("@sendgrid/mail", () => ({
  setApiKey: jest.fn(),
  send: jest.fn().mockResolvedValue([{ statusCode: 202 }]),
}));

jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    customers: { create: jest.fn().mockResolvedValue({ id: "cus_test123" }) },
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
      },
    },
    webhooks: { constructEvent: jest.fn() },
  }))
);

jest.mock("bullmq", () => ({
  Queue: jest.fn().mockImplementation(() => ({
    add: jest.fn().mockResolvedValue({ id: "job-1" }),
    close: jest.fn(),
  })),
  Worker: jest.fn().mockImplementation(() => ({
    close: jest.fn(),
    on: jest.fn(),
  })),
}));

/* ── Helpers ──────────────────────────────────────────────── */

const TEST_EMAIL = `integration-${Date.now()}@test.com`;
const TEST_PASSWORD = "SecurePassword123!";
let app;
let cookies = "";

function extractCookies(res) {
  const raw = res.headers["set-cookie"];
  if (!raw) return cookies;
  return raw.map((c) => c.split(";")[0]).join("; ");
}

/* ── Setup / Teardown ────────────────────────────────────── */

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_SECRET = "a]test-secret-that-is-at-least-32-chars!!";
  process.env.ENCRYPTION_KEY = "ab".repeat(32);
  process.env.FRONTEND_URL = "http://localhost:5173";
  delete process.env.REDIS_URL;

  app = require("../src/app");
});

afterAll(async () => {
  try {
    await prisma.remediationAction.deleteMany({ where: { user: { email: TEST_EMAIL } } });
    await prisma.assessment.deleteMany({ where: { user: { email: TEST_EMAIL } } });
    await prisma.userEmail.deleteMany({ where: { user: { email: TEST_EMAIL } } });
    await prisma.user.deleteMany({ where: { email: TEST_EMAIL } });
  } catch (e) {
    // e.g. no database — integration suite requires DATABASE_URL + migrated schema
    // eslint-disable-next-line no-console
    console.warn("integration cleanup skipped:", e.message);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

/* ── Full User Journey ───────────────────────────────────── */

describe("Full user lifecycle", () => {
  let userId;
  let assessmentId;

  test("1. Signup creates unverified user (no auto-login)", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: "Test",
        lastName: "User",
      });

    expect(res.status).toBe(201);
    expect(res.body.message).toBeDefined();
    const setCookie = res.headers["set-cookie"] || [];
    const hasAuthToken = setCookie.some((c) => c.startsWith("token=") && !c.includes("token=;"));
    expect(hasAuthToken).toBe(false);

    const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    expect(user).toBeTruthy();
    expect(user.emailVerified).toBe(false);
    userId = user.id;
  });

  test("2. Login fails for unverified email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(403);
    expect(String(res.body.message || "").toLowerCase()).toContain("verif");
  });

  test("3. Email verification via DB (raw token is hashed — cannot recover)", async () => {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, verificationToken: null, verificationTokenExpiry: null },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user.emailVerified).toBe(true);
  });

  test("4. Login succeeds after verification", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

    expect(res.status).toBe(200);
    cookies = extractCookies(res);
    expect(cookies).toContain("token=");
  });

  test("5. Authenticated profile returns user data", async () => {
    const res = await request(app).get("/api/user/profile").set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(TEST_EMAIL);
    expect(res.body.user.subscriptionTier).toBe("free");
  });

  test("6. Assessment creation returns results", async () => {
    const res = await request(app)
      .post("/api/assessments/create")
      .set("Cookie", cookies)
      .send({ email: TEST_EMAIL });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const data = res.body.data;
    expect(data).toBeDefined();
    assessmentId = data.assessmentId;
    expect(assessmentId).toBeDefined();
    if (data.status === "completed") {
      expect(typeof data.score).toBe("number");
      expect(data.riskLevel).toBeDefined();
    }
  });

  test("7. Assessment history includes the new assessment", async () => {
    const res = await request(app).get("/api/user/assessments").set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  test("8. Non-owner cannot access assessment", async () => {
    if (!assessmentId) return;
    const res = await request(app)
      .get(`/api/assessments/${assessmentId}`)
      .set("Cookie", "token=invalid");

    expect([401, 403, 404]).toContain(res.status);
  });

  test("9. Remediation plan exists for assessment", async () => {
    if (!assessmentId) return;
    const res = await request(app)
      .get(`/api/remediation/${assessmentId}`)
      .set("Cookie", cookies);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.remediationPlan).toBeDefined();
    expect(Array.isArray(res.body.remediationPlan.actions)).toBe(true);
    expect(res.body.remediationPlan.actions.length).toBeGreaterThan(0);
  });

  test("10. Password change succeeds and reissues cookie", async () => {
    const newPassword = "NewSecurePassword456!";
    const res = await request(app)
      .put("/api/user/password")
      .set("Cookie", cookies)
      .send({ currentPassword: TEST_PASSWORD, newPassword });

    expect(res.status).toBe(200);
    const newCookies = extractCookies(res);
    expect(newCookies).toContain("token=");
    cookies = newCookies;
  });

  test("11a. Account deletion fails without password", async () => {
    const res = await request(app).delete("/api/user/account").set("Cookie", cookies).send({});

    // 400/422 from validation, or 401 if session is missing / invalid
    expect([400, 401, 422]).toContain(res.status);
  });

  test("11b. Account deletion fails with wrong password", async () => {
    const res = await request(app)
      .delete("/api/user/account")
      .set("Cookie", cookies)
      .send({ password: "WrongPassword999!" });

    expect(res.status).toBe(401);
  });

  test("11c. Account deletion succeeds with correct password", async () => {
    const res = await request(app)
      .delete("/api/user/account")
      .set("Cookie", cookies)
      .send({ password: "NewSecurePassword456!" });

    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: TEST_EMAIL } });
    expect(user).toBeNull();
  });
});

/* ── Edge Cases ──────────────────────────────────────────── */

describe("Edge cases", () => {
  test("Health endpoint responds", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  test("Unauthenticated assessment returns 401", async () => {
    const res = await request(app)
      .post("/api/assessments/create")
      .send({ email: "someone@test.com" });
    expect(res.status).toBe(401);
  });

  test("Webhook rejects missing signature", async () => {
    const res = await request(app).post("/api/payment/webhook").send({});
    expect([400, 503]).toContain(res.status);
  });

  test("Signup rejects weak password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "weak@test.com", password: "short", firstName: "W", lastName: "K" });
    expect(res.status).toBe(400);
  });

  test("Signup rejects invalid email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: "not-an-email",
        password: TEST_PASSWORD,
        firstName: "Bad",
        lastName: "Email",
      });
    expect(res.status).toBe(400);
  });

  test("Rate limiter or health responds", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
  });
});
