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

describe("POST /api/articles/:article_id/comments", () => {
  test("Responds with 200 code, and newly created comment object in response body, when logged in user posts a comment to an article.", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const commentResult = await request(app)
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: "testingBody",
      })
      .expect(201);
    expect(commentResult._body).toMatchObject({
      comment_id: testData.commentData.length + 1,
      article_id: 1,
      author: "butter_bridge",
      body: "testingBody",
      created_at: expect.any(String),
      votes: 0,
    });
    expect(Object.keys(commentResult._body).length).toBe(6);
  });
  test("Responds with 200 code, and newly created comment object in response body, when admin posts a comment to an article.", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const commentResult = await request(app)
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: "testingBody",
      })
      .expect(201);
    expect(commentResult._body).toMatchObject({
      comment_id: testData.commentData.length + 1,
      article_id: 1,
      author: "admin",
      body: "testingBody",
      created_at: expect.any(String),
      votes: 0,
    });
    expect(Object.keys(commentResult._body).length).toBe(6);
  });
  test("401 response with correct message when attempting to post article but not logged in", async () => {
    const errorResponse = await request(app)
      .post("/api/articles/1/comments")
      .send({
        body: "testingBody",
      })
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
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: "testingBody",
      })
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 400 response when attempting to post comment for an article, but article_id is not a number", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const errorResponse = await request(app)
      .post("/api/articles/one/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: "testingBody",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to post comment for an article but article_id is a non-positive integer", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles/-1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: "testingBody",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to post comment for an article but article_id is a positive float", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles/0.9/comments")
      .set("Authorization", `Bearer ${token}`)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to access endpoint but request body doesnt contain the required body property", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("Comment body is required");
  });
  test("Correct 400 response when user attempts to post comment to an article but body property is not a string", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: 5,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Comment body must be in a valid format"
    );
  });
  test("Correct 400 response when user attempts to post comment to an article but body property is empty text", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: "",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Comment body must not be empty text"
    );
  });
  test("Correct 400 response when user attempts to post comment to an article but body property is too long", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    let commentBody = "";
    let i = 0;
    while (i < 1005) {
      commentBody += "a";
      i++;
    }

    const errorResponse = await request(app)
      .post("/api/articles/1/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({
        body: commentBody,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Comment body must not be greater than 1000 characters in length"
    );
  });
  test("404 response with correct message when attempting to post comment for a non-existent article", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const errorResponse = await request(app)
      .post("/api/articles/999/comments")
      .set("Authorization", `Bearer ${token}`)
      .send({ body: "testingBody" })
      .expect(404);

    expect(errorResponse.body.message).toBe("Article not found");
  });
});
