const request = require("supertest");
const app = require("../../app");
const db = require("../../db/connection");
const seed = require("../../db/seeds/seed");
const testData = require("../../db/data/test-data");
const endpoints = require("../../endpoints.json");

beforeEach(async () => {
  await db.query("BEGIN;"); // Start a new transaction
  // await db.query(
  //   `TRUNCATE TABLE comments, articles, users, topics, deletedUsers RESTART IDENTITY CASCADE;`
  // );
  await seed(testData);
});

afterEach(async () => {
  await db.query("ROLLBACK;"); // Roll back transaction to reset state for next test
});

afterAll(() => db.end());

describe("GET - /api", () => {
  test("200: Should return 200 status code and correct message containing object listing endpoints", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpoints);
      });
  });
});
