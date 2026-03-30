const request = require("supertest");

describe("auth", () => {
  const app = require("../src/app");

  test("signup validation rejects weak password", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        email: `x-${Date.now()}@example.com`,
        password: "short",
        firstName: "T",
        lastName: "U",
      })
      .set("Accept", "application/json");
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
