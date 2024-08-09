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

describe("GET /api/articles/:article_id/comments", () => {
  test("200 status code and correct array of comments returned when endpoint is called by a user not logged in", async () => {
    const commentsResult = await request(app)
      .get("/api/articles/1/comments")
      .expect(200);

    commentsResult.body.forEach((article) => {
      expect(article).toMatchObject({
        comment_id: expect.any(Number),
        article_id: 1,
        author: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        body: expect.any(String),
      });
    });

    expect(commentsResult.body).toHaveLength(11);
    expect(commentsResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("200 status code and correct array of comments returned when endpoint is called by a logged in user", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const commentsResult = await request(app)
      .get("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    commentsResult.body.forEach((article) => {
      expect(article).toMatchObject({
        comment_id: expect.any(Number),
        article_id: 1,
        author: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        body: expect.any(String),
      });
    });

    expect(commentsResult.body).toHaveLength(11);
    expect(commentsResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("200 status code and correct array of comments returned when endpoint is called by an admin", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const commentsResult = await request(app)
      .get("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    commentsResult.body.forEach((article) => {
      expect(article).toMatchObject({
        comment_id: expect.any(Number),
        article_id: 1,
        author: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        body: expect.any(String),
      });
    });

    expect(commentsResult.body).toHaveLength(11);
    expect(commentsResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("200 status code and an empty array returned when endpoint is called by a user not logged in, with an id for an existing article which has no comments", async () => {
    const commentsResult = await request(app)
      .get("/api/articles/4/comments")
      .expect(200);

    expect(commentsResult.body).toEqual([]);
  });
  test("Correct 400 response when attempting to get comments for an article, but article_id is not a number", async () => {
    const errorResponse = await request(app)
      .get("/api/articles/one/comments")
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to get comments for an article but article_id is a non-positive integer", async () => {
    const errorResponse = await request(app)
      .get("/api/articles/-1/comments")
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to get comments for an article but article_id is a positive float", async () => {
    const errorResponse = await request(app)
      .get("/api/articles/0.9/comments")
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("404 response with correct message when attempting to get comments for a non-existent article", async () => {
    const errorResponse = await request(app)
      .get("/api/articles/999/comments")
      .expect(404);

    expect(errorResponse.body.message).toBe("Article not found");
  });
});
