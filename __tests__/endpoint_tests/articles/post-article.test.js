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

describe("POST /api/articles", () => {
  test("Responds with 200 code, and newly created article object in response body, when user posts an article. No article_img_url provided should result in default article_img_url in response body.", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
      })
      .expect(201);
    expect(articlesResult._body).toMatchObject({
      article_id: testData.articleData.length + 1,
      title: "testingTitle",
      topic: "mitch",
      author: "butter_bridge",
      body: "testingBody",
      created_at: expect.any(String),
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
    });
    expect(Object.keys(articlesResult._body).length).toBe(8);
  });
  test("Responds with 200 code, and newly created article object in response body, when admin posts an article. No article_img_url provided should result in default article_img_url in response body.", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
      })
      .expect(201);
    expect(articlesResult._body).toMatchObject({
      article_id: testData.articleData.length + 1,
      title: "testingTitle",
      topic: "mitch",
      author: "admin",
      body: "testingBody",
      created_at: expect.any(String),
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
    });
    expect(Object.keys(articlesResult._body).length).toBe(8);
  });
  test("Responds with 200 code, and newly created article object in response body, when user posts an article. Article_img_url in the response body should equal the url passed in the request body.", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
        article_img_url:
          "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      })
      .expect(201);
    expect(articlesResult._body).toMatchObject({
      article_id: testData.articleData.length + 1,
      title: "testingTitle",
      topic: "mitch",
      author: "butter_bridge",
      body: "testingBody",
      created_at: expect.any(String),
      votes: 0,
      article_img_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
    });
    expect(Object.keys(articlesResult._body).length).toBe(8);
  });
  test("Responds with 200 code, and newly created article object in response body, when admin posts an article. Article_img_url in the response body should equal the url passed in the request body.", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;
    const articlesResult = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
        article_img_url:
          "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      })
      .expect(201);
    expect(articlesResult._body).toMatchObject({
      article_id: testData.articleData.length + 1,
      title: "testingTitle",
      topic: "mitch",
      author: "admin",
      body: "testingBody",
      created_at: expect.any(String),
      votes: 0,
      article_img_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
    });
    expect(Object.keys(articlesResult._body).length).toBe(8);
  });
  test("401 response with correct message when attempting to post article but not logged in", async () => {
    const errorResponse = await request(app)
      .post("/api/articles")
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
        article_img_url:
          "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
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
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
        article_img_url:
          "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      })
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 400 response when user attempts to access endpoint but request body doesnt contain all required properties ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Title, body and topic are required"
    );
  });
  test("Correct 400 response when title is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: 5, body: "testingBody", topic: "mitch" })
      .expect(400);

    expect(errorResponse.body.message).toBe("Title must be in a valid format");
  });
  test("Correct 400 response when title is empty text ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "", body: "testingBody", topic: "mitch" })
      .expect(400);

    expect(errorResponse.body.message).toBe("Title must not be empty text");
  });
  test("Correct 400 response when article body is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "testingTitle", body: true, topic: "mitch" })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Article body must be in a valid format"
    );
  });
  test("Correct 400 response when article body is empty text ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "testingTitle", body: " ", topic: "mitch" })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Article body must not be empty text"
    );
  });
  test("Correct 400 response when url to article image is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
        article_img_url: 8,
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "URL to article image must be in a valid format"
    );
  });
  test("Correct 400 response when URL to article image is empty text ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "mitch",
        article_img_url: " ",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "URL to article image must not be empty text"
    );
  });
  test("Correct 400 response when topic is not valid", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "testingTitle",
        body: "testingBody",
        topic: "dogs",
      })
      .expect(400);

    expect(errorResponse.body.message).toBe("Topic must be a valid topic");
  });
  test("Correct 400 response when article body is greater than 5000 characters in length", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    let body = "";
    let i = 0;
    while (i < 5005) {
      body += "a";
      i++;
    }

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "testingTitle", body: body, topic: "mitch" })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Article body must not be greater than 5000 characters in length"
    );
  });
  test("Correct 400 response when article title is greater than 200 characters in length", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    let title = "";
    let i = 0;
    while (i < 202) {
      title += "a";
      i++;
    }

    const errorResponse = await request(app)
      .post("/api/articles")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: title, body: "testingBody", topic: "mitch" })
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Title must not be greater than 200 characters in length"
    );
  });
});
