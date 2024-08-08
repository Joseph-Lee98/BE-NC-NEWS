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

describe("DELETE /api/articles/:article_id", () => {
  test("Responds with 204 code when logged in user deletes their article", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .delete("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    expect(articlesResult.text).toBe("");

    const articles = await db.query("SELECT * FROM articles");
    expect(articles.rowCount).toBe(testData.articleData.length - 1);

    const comments = await db.query("SELECT * FROM comments");
    comments.rows.forEach((comment) => {
      expect(comment.article_id).not.toBe(1);
    });
  });
  test("Responds with 204 code when admin deletes a user's article", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .delete("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    expect(articlesResult.text).toBe("");

    const articles = await db.query("SELECT * FROM articles");
    expect(articles.rowCount).toBe(testData.articleData.length - 1);

    const comments = await db.query("SELECT * FROM comments");
    comments.rows.forEach((comment) => {
      expect(comment.article_id).not.toBe(1);
    });
  });
  test("401 response with correct message when attempting to delete article but not logged in", async () => {
    const errorResponse = await request(app)
      .delete("/api/articles/1")
      .expect(401);

    expect(errorResponse.body.message).toBe("No token provided");
  });
  test("Correct 403 response when user attempts to access the endpoint but their account has been deleted", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .delete("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`);

    const errorResponse = await request(app)
      .delete("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 400 response when user attempts to delete article but article_id is not a number", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/articles/one")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to delete article but article_id is a non-positive integer", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/articles/-1")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to delete article but article_id is a positive float", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/articles/0.9")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("404 response with correct message when attempting to delete non-existent article", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/articles/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(errorResponse.body.message).toBe("Article not found");
  });
  test("403 response with correct message when logged in user attempts to delete another user's article", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/articles/2")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Forbidden");
  });
});
