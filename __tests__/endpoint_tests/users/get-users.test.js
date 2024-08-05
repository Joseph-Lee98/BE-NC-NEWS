const request = require("supertest");
const app = require("../../../app");
const db = require("../../../db/connection");
const seed = require("../../../db/seeds/seed");
const testData = require("../../../db/data/test-data");

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

describe("GET /api/users", () => {
  test("200 status code and correct array of users in the response body for admin successfully using the endpoint", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const result = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(result._body).toEqual([
      {
        username: "butter_bridge",
        name: "jonny",
        avatar_url:
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        is_private: false,
        deleted_at: null,
        comment_count: 5,
        article_count: 4,
      },
      {
        username: "icellusedkars",
        name: "sam",
        avatar_url:
          "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
        is_private: false,
        deleted_at: null,
        comment_count: 13,
        article_count: 6,
      },
      {
        username: "lurker",
        name: "do_nothing",
        avatar_url:
          "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
        is_private: false,
        deleted_at: null,
        comment_count: 0,
        article_count: 0,
      },
      {
        username: "rogersop",
        name: "paul",
        avatar_url:
          "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
        is_private: true,
        deleted_at: null,
        comment_count: 0,
        article_count: 3,
      },
    ]);
  });
  test("401 response with correct message when attempting to get all users details but not logged in", async () => {
    const errorResponse = await request(app).get("/api/users").expect(401);
    expect(errorResponse.body.message).toBe("No token provided");
  });
  test("403 response with correct message when attempting to get all users details but logged in as user", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;
    const errorResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);
    expect(errorResponse.body.message).toBe("Forbidden");
  });
  test("Correct 401 response when user attempts to access the endpoint but their account has been deleted", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    await request(app)
      .delete("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`);

    const errorResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
});
