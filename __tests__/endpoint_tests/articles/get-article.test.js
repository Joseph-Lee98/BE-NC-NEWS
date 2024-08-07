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

describe("GET /api/articles/:article_id", () => {
  test("200 status code and correct article object returned when endpoint is called by a user not logged in", async () => {
    const articleResult = await request(app).get("/api/articles/1").expect(200);

    expect(articleResult._body).toEqual({
      article_id: 1,
      body: "I find this existence challenging",
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      comment_count: 11,
    });
  });
  test("200 status code and correct article object returned when endpoint is called by a logged in user", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articleResult = await request(app)
      .get("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(articleResult._body).toEqual({
      article_id: 1,
      body: "I find this existence challenging",
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      comment_count: 11,
    });
  });
  test("200 status code and correct article object returned when endpoint is called by admin", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articleResult = await request(app)
      .get("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(articleResult._body).toEqual({
      article_id: 1,
      body: "I find this existence challenging",
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      comment_count: 11,
    });
  });
  test("400 status code and correct error message returned when endpoint is called by a user not logged in, with invalid article id (string)", async () => {
    const articleResult = await request(app)
      .get("/api/articles/one")
      .expect(400);

    expect(articleResult.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("400 status code and correct error message returned when endpoint is called by a user not logged in, with invalid article id (positive float)", async () => {
    const articleResult = await request(app)
      .get("/api/articles/1.5")
      .expect(400);

    expect(articleResult.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("400 status code and correct error message returned when endpoint is called by a user not logged in, with invalid article id (non-positive integer)", async () => {
    const articleResult = await request(app).get("/api/articles/0").expect(400);

    expect(articleResult.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("404 status code and correct error message returned when endpoint is called by a user not logged in, with article not found in database", async () => {
    const articleResult = await request(app)
      .get("/api/articles/999")
      .expect(404);

    expect(articleResult.body.message).toBe("Article not found");
  });
});
