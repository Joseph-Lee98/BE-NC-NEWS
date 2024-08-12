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
  test("Should return 200 status code and object documenting all endpoints, when called by user not logged in", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
  test("Should return 200 status code and object documenting all endpoints, when called by logged in user", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const endpointsResult = await request(app)
      .get("/api")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(endpointsResult.body).toEqual(endpoints);
  });
  test("Should return 200 status code and object documenting all endpoints, when called by admin", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const endpointsResult = await request(app)
      .get("/api")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(endpointsResult.body).toEqual(endpoints);
  });
});
