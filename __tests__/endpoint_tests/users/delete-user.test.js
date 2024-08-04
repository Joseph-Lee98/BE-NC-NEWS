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

describe("DELETE /api/users/:username", () => {
  test("user deletes their account, issue appropriate response, and sets author of any comments and articles written by user to NULL", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    const deleteUserResponse = await request(app)
      .delete("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(deleteUserResponse.text).toBe("");

    const deletedUser = await db.query(
      "SELECT deleted_at FROM users WHERE username = $1",
      [loginObj.username]
    );

    expect(deletedUser.rows[0].deleted_at).not.toBeNull();

    const comments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [loginObj.username]
    );

    expect(comments.rowCount).toBe(0);

    const articles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [loginObj.username]
    );

    expect(articles.rowCount).toBe(0);
  });
  test("admin deletes a user account, issue appropriate response, and sets author of any comments and articles written by user to NULL", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    const deleteUserResponse = await request(app)
      .delete("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(204);

    expect(deleteUserResponse.text).toBe("");

    const deletedUsername = "butter_bridge";

    const deletedUser = await db.query(
      "SELECT deleted_at FROM users WHERE username = $1",
      [deletedUsername]
    );

    expect(deletedUser.rows[0].deleted_at).not.toBeNull();

    const comments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [deletedUsername]
    );

    expect(comments.rowCount).toBe(0);

    const articles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [deletedUsername]
    );

    expect(articles.rowCount).toBe(0);
  });
  test("Correct 401 response when attempting to delete user when not logged in", async () => {
    const errorResponse = await request(app)
      .delete("/api/users/butter_bridge")
      .expect(401);

    expect(errorResponse.body.message).toBe("No token provided");
  });

  test("Correct 403 response when user attempts to access the endpoint for their account but account has been deleted", async () => {
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
      .delete("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 403 response when user attempts to access the endpoint for another account ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .get("/api/users/rogersop")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Forbidden");
  });
});
