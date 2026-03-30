const request = require("supertest");

describe("payment routes", () => {
  const app = require("../src/app");

  test("create-checkout returns 401 without session", async () => {
    const res = await request(app)
      .post("/api/payment/create-checkout")
      .send({ plan: "monthly" })
      .set("Accept", "application/json");
    expect(res.status).toBe(401);
  });
});
