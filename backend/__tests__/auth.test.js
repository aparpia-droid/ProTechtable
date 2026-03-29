/**
 * Auth flow tests require DATABASE_URL and a running PostgreSQL instance.
 * Run: DATABASE_URL=... npm test -- __tests__/auth.test.js
 */
const request = require("supertest");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb("auth integration", () => {
  const app = require("../src/app");
  const testEmail = `test-${Date.now()}@example.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  test("signup validation rejects weak password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password: "short",
        firstName: "T",
        lastName: "U",
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("signup and login after verification", async () => {
    const password = "StrongPass1!x";
    let signup = await request(app)
      .post("/api/auth/signup")
      .send({
        email: testEmail,
        password,
        firstName: "Test",
        lastName: "User",
      })
      .set("Accept", "application/json");
    expect(signup.status).toBe(200);
    expect(signup.body.success).toBe(true);

    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    expect(user).toBeTruthy();
    const token = user.verificationToken;
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password })
      .set("Accept", "application/json");
    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
    expect(login.body.user.email).toBe(testEmail);
  });
});
