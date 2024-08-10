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

describe("DELETE /api/comments/:comment_id", () => {
  test("Responds with 204 code when logged in user deletes their comment", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const commentsResult = await request(app)
      .delete("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    expect(commentsResult.text).toBe("");

    const comments = await db.query("SELECT * FROM comments");
    expect(comments.rowCount).toBe(testData.commentData.length - 1);
    comments.rows.forEach((comment) => {
      expect(comment.comment_id).not.toBe(1);
    });
  });
  test("Responds with 204 code when admin deletes a user's comment", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const commentsResult = await request(app)
      .delete("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);
    expect(commentsResult.text).toBe("");

    const comments = await db.query("SELECT * FROM comments");
    expect(comments.rowCount).toBe(testData.commentData.length - 1);
    comments.rows.forEach((comment) => {
      expect(comment.comment_id).not.toBe(1);
    });
  });
  test("401 response with correct message when attempting to delete comment but not logged in", async () => {
    const errorResponse = await request(app)
      .delete("/api/comments/1")
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
      .delete("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 400 response when user attempts to delete comment but comment_id is not a number", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/comments/one")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "comment_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to delete comment but comment_id is a non-positive integer", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/comments/-1")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "comment_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to delete comment but comment_id is a positive float", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/comments/0.9")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "comment_id must be a valid, positive integer"
    );
  });
  test("404 response with correct message when attempting to delete non-existent comment", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/comments/999")
      .set("Authorization", `Bearer ${token}`)
      .expect(404);

    expect(errorResponse.body.message).toBe("Comment not found");
  });
  test("403 response with correct message when logged in user attempts to delete another user's comment", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .delete("/api/comments/3")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Forbidden");
  });
});
