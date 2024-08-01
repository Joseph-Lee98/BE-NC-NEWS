const request = require("supertest");
const app = require("../../app");
const db = require("../../db/connection");
const seed = require("../../db/seeds/seed");
const testData = require("../../db/data/test-data");

beforeEach(async () => {
  await db.query("BEGIN;"); // Start a new transaction
  await seed(testData);
});

afterEach(async () => {
  await db.query("ROLLBACK;"); // Roll back transaction to reset state for next test
});

afterAll(() => db.end());

describe("Error handling middleware", () => {
  test("404 Route not found", () => {
    return request(app)
      .get("/api/topicss")
      .expect(404)
      .then(({ body }) => {
        expect(body.message).toBe("Route not found");
      });
  });
});
