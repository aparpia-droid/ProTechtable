const request = require("supertest");

describe("middleware", () => {
  const app = require("../src/app");

  test("health endpoint responds", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});
