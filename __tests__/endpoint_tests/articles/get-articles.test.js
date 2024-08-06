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

describe("GET /api/articles", () => {
  test("200 status code and correct array of articles returned when endpoint is called by a user not logged in, with no queries", async () => {
    const articlesResult = await request(app).get("/api/articles").expect(200);

    articlesResult.body.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        topic: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
    });

    expect(articlesResult.body).toHaveLength(testData.articleData.length);
    expect(articlesResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });

  test("200 status code and correct array of articles returned when endpoint is called by a logged in user, with no queries", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .get("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    articlesResult.body.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        topic: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
    });

    expect(articlesResult.body).toHaveLength(testData.articleData.length);
    expect(articlesResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("200 status code and correct array of articles returned when endpoint is called by admin, with no queries", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .get("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    articlesResult.body.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        topic: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
    });

    expect(articlesResult.body).toHaveLength(testData.articleData.length);
    expect(articlesResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("200 status code and correct array of articles returned when endpoint is called by a user not logged in, with valid topic query", async () => {
    const articlesResult = await request(app)
      .get("/api/articles?topic=mitch")
      .expect(200);

    articlesResult.body.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        topic: "mitch",
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
    });

    expect(articlesResult.body).toHaveLength(testData.articleData.length - 1);
    expect(articlesResult.body).toBeSortedBy("created_at", {
      descending: true,
    });
  });
  test("200 status code and correct array of articles returned when endpoint is called by a user not logged in, with valid query for sorting by with order direction", async () => {
    const articlesResult = await request(app)
      .get("/api/articles?sort_by=comment_count&order_by=desc")
      .expect(200);

    articlesResult.body.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        topic: expect.any(String),
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
    });

    expect(articlesResult.body).toHaveLength(testData.articleData.length);
    expect(articlesResult.body).toBeSortedBy("comment_count", {
      descending: true,
    });
  });
  test("200 status code and correct array of articles returned when endpoint is called by a user not logged in, with valid query for topic, and sorting by with order direction", async () => {
    const articlesResult = await request(app)
      .get("/api/articles?topic=mitch&sort_by=comment_count&order_by=desc")
      .expect(200);

    articlesResult.body.forEach((article) => {
      expect(article).toMatchObject({
        article_id: expect.any(Number),
        title: expect.any(String),
        author: expect.any(String),
        topic: "mitch",
        created_at: expect.any(String),
        votes: expect.any(Number),
        article_img_url: expect.any(String),
        comment_count: expect.any(Number),
      });
    });

    expect(articlesResult.body).toHaveLength(testData.articleData.length - 1);
    expect(articlesResult.body).toBeSortedBy("comment_count", {
      descending: true,
    });
  });
  test("400 response code with correct error message when user, not logged in, uses an invalid sort_by query when interacting with the endpoint", async () => {
    const errorResponse = await request(app)
      .get("/api/articles?sort_by=author&order_by=asc")
      .expect(400);
    expect(errorResponse.body.message).toBe("Invalid sort_by value");
  });
  test("400 response code with correct error message when user, not logged in, uses an invalid order_by query when interacting with the endpoint", async () => {
    const errorResponse = await request(app)
      .get("/api/articles?sort_by=comment_count&order_by=increasing")
      .expect(400);
    expect(errorResponse.body.message).toBe("Invalid order_by value");
  });
  test("400 response code with correct error message when user, not logged in, uses a valid sort_by query but no order_by query", async () => {
    const errorResponse = await request(app)
      .get("/api/articles?sort_by=comment_count")
      .expect(400);
    expect(errorResponse.body.message).toBe(
      "Query must include an order_by if querying with a sort_by"
    );
  });
  test("400 response code with correct error message when user, not logged in, uses a valid order_by query but no sort_by query", async () => {
    const errorResponse = await request(app)
      .get("/api/articles?order_by=asc")
      .expect(400);
    expect(errorResponse.body.message).toBe(
      "Query must include a sort_by if querying with an order_by"
    );
  });
  test("400 response code with correct error message when user, not logged in, uses an invalid topic query", async () => {
    const errorResponse = await request(app)
      .get("/api/articles?topic=dogs")
      .expect(400);
    expect(errorResponse.body.message).toBe("Topic must be a valid topic");
  });
});
