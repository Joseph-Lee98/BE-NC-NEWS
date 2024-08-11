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

describe("PATCH /api/comments/:comment_id", () => {
  test("Responds with 200 code, and updated comment object in the response body, when logged in user patches their comment with an increase of 1 vote", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const updatedCommentResult = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(200);

    expect(updatedCommentResult._body).toEqual({
      comment_id: 1,
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 17,
      author: "butter_bridge",
      article_id: 9,
      created_at: "2020-04-06T12:17:00.000Z",
    });
  });
  test("Responds with 200 code, and updated comment object in the response body, when logged in user patches their comment with a decrease of 1 vote", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const updatedCommentResult = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: -1,
      })
      .expect(200);

    expect(updatedCommentResult._body).toEqual({
      comment_id: 1,
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 15,
      author: "butter_bridge",
      article_id: 9,
      created_at: "2020-04-06T12:17:00.000Z",
    });
  });
  test("Responds with 200 code, and updated comment object in the response body, when logged in user patches another user's comment with an increase of 1 vote", async () => {
    const loginObj = {
      username: "icellusedkars",
      password: "Ic3ll@usedK@rs2024",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const updatedCommentResult = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(200);

    expect(updatedCommentResult._body).toEqual({
      comment_id: 1,
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 17,
      author: "butter_bridge",
      article_id: 9,
      created_at: "2020-04-06T12:17:00.000Z",
    });
  });
  test("Responds with 200 code, and updated comment object in the response body, when logged in user patches another user's comment with a decrease of 1 vote", async () => {
    const loginObj = {
      username: "icellusedkars",
      password: "Ic3ll@usedK@rs2024",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const updatedCommentResult = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: -1,
      })
      .expect(200);

    expect(updatedCommentResult._body).toEqual({
      comment_id: 1,
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 15,
      author: "butter_bridge",
      article_id: 9,
      created_at: "2020-04-06T12:17:00.000Z",
    });
  });
  test("Responds with 200 code, and updated comment object in the response body, when admin patches a user's comment with an increase of 1 vote", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const updatedCommentResult = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(200);

    expect(updatedCommentResult._body).toEqual({
      comment_id: 1,
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 17,
      author: "butter_bridge",
      article_id: 9,
      created_at: "2020-04-06T12:17:00.000Z",
    });
  });
  test("Responds with 200 code, and updated comment object in the response body, when admin patches another user's comment with a decrease of 1 vote", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const updatedCommentResult = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: -1,
      })
      .expect(200);

    expect(updatedCommentResult._body).toEqual({
      comment_id: 1,
      body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
      votes: 15,
      author: "butter_bridge",
      article_id: 9,
      created_at: "2020-04-06T12:17:00.000Z",
    });
  });
  test("401 response with correct message when attempting to patch comment but not logged in", async () => {
    const errorResponse = await request(app)
      .patch("/api/comments/1")
      .send({
        inc_votes: 1,
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
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 400 response when user attempts to patch comment but inc_votes is missing from request body", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("Inc_votes is required");
  });
  test("Correct 400 response when user attempts to patch comment but comment_id is not a number", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/one")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "comment_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to patch comment but comment_id is a non-positive integer", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/-1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "comment_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to patch comment but comment_id is a positive float", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/0.9")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "comment_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to patch comment but inc_votes is a string", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: "1",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("inc_votes must be +1 or -1");
  });
  test("Correct 400 response when user attempts to patch comment but inc_votes is a number that is not 1 or -1", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 0,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("inc_votes must be +1 or -1");
  });
  test("404 response with correct message when attempting to patch a non-existent comment", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/comments/999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(404);

    expect(errorResponse.body.message).toBe("Comment not found");
  });
});
