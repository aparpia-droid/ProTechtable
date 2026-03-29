/**
 * Assessment tests require DATABASE_URL and seeded data brokers.
 */
const request = require("supertest");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb("assessment authorization", () => {
  const app = require("../src/app");

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("create assessment requires auth", async () => {
    const res = await request(app)
      .post("/api/assessments/create")
      .send({ email: "scan@example.com" })
      .set("Accept", "application/json");
    expect(res.status).toBe(401);
  });
});
