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

describe("PATCH /api/articles/:article_id", () => {
  test("Responds with 200 code, and updated article object in the response body, when logged in user patches the article with an increase of 1 vote", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(200);

    expect(articlesResult._body).toEqual({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 101,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });
  test("Responds with 200 code, and updated article object in the response body, when logged in user patches the article with a decrease of 1 vote", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: -1,
      })
      .expect(200);

    expect(articlesResult._body).toEqual({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 99,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });
  test("Responds with 200 code, and updated article object in the response body, when admin patches the article with an increase of 1 vote", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(200);

    expect(articlesResult._body).toEqual({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 101,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });
  test("Responds with 200 code, and updated article object in the response body, when admin patches the article with a decrease of 1 vote", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: -1,
      })
      .expect(200);

    expect(articlesResult._body).toEqual({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 99,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });
  test("401 response with correct message when attempting to patch article but not logged in", async () => {
    const errorResponse = await request(app)
      .patch("/api/articles/1")
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
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 400 response when user attempts to patch article but inc_votes is missing from request body", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("Inc_votes is required");
  });
  test("Correct 400 response when user attempts to patch article but article_id is not a number", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/one")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to patch article but article_id is a non-positive integer", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/-1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to patch article but article_id is a positive float", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/0.9")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "article_id must be a valid, positive integer"
    );
  });
  test("Correct 400 response when user attempts to patch article but inc_votes is a string", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: "1",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("inc_votes must be +1 or -1");
  });
  test("Correct 400 response when user attempts to patch article but inc_votes is a number that is not 1 or -1", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/1")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 0,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("inc_votes must be +1 or -1");
  });
  test("404 response with correct message when attempting to access non-existent article", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/999")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(404);

    expect(errorResponse.body.message).toBe("Article not found");
  });
  test("403 response with correct message when logged in user attempts to patch article written by another user", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/articles/2")
      .set("Authorization", `Bearer ${token}`)
      .send({
        inc_votes: 1,
      })
      .expect(403);

    expect(errorResponse.body.message).toBe("Forbidden");
  });
});
