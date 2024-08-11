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

describe("GET /api/users/:username", () => {
  test("200 status code and correct response object for getting a user's account information when not logged in", async () => {
    await request(app)
      .get("/api/users/butter_bridge")
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(5);
        expect(body.userInformation).toEqual({
          name: "jonny",
          username: "butter_bridge",
          role: "user",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });

        expect(body.articlesByUser).toHaveLength(4);

        expect(body.articlesByUser).toBeSortedBy("created_at", {
          descending: true,
        });

        const expectedArticleStructure = {
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
        };

        // Ensure each object has the correct keys
        body.articlesByUser.forEach((article) => {
          expect(article).toMatchObject(expectedArticleStructure);
        });

        expect(body.commentsByUser).toHaveLength(5);

        expect(body.commentsByUser).toBeSortedBy("comment_created_at", {
          descending: true,
        });

        const expectedCommentStructure = {
          comment_id: expect.any(Number),
          article_id: expect.any(Number),
          comment_body: expect.any(String),
          comment_author: "butter_bridge",
          comment_votes: expect.any(Number),
          comment_created_at: expect.any(String),
          article_title: expect.any(String),
          article_topic: expect.any(String),
          article_body: expect.any(String),
          articles_created_at: expect.any(String),
          article_votes: expect.any(Number),
          article_img_url: expect.any(String),
        };

        // Ensure each object has the correct keys
        body.commentsByUser.forEach((comment) => {
          expect(comment).toMatchObject(expectedCommentStructure);
        });

        expect(body.commentCount).toBe(5);
        expect(body.articleCount).toBe(4);
      });
  });
  test("200 status code and correct response object for user getting their account information", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .get("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(5);
        expect(body.userInformation).toEqual({
          name: "jonny",
          username: "butter_bridge",
          role: "user",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });

        expect(body.articlesByUser).toHaveLength(4);

        expect(body.articlesByUser).toBeSortedBy("created_at", {
          descending: true,
        });

        const expectedArticleStructure = {
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
        };

        // Ensure each object has the correct keys
        body.articlesByUser.forEach((article) => {
          expect(article).toMatchObject(expectedArticleStructure);
        });

        expect(body.commentsByUser).toHaveLength(5);

        expect(body.commentsByUser).toBeSortedBy("comment_created_at", {
          descending: true,
        });

        const expectedCommentStructure = {
          comment_id: expect.any(Number),
          article_id: expect.any(Number),
          comment_body: expect.any(String),
          comment_author: "butter_bridge",
          comment_votes: expect.any(Number),
          comment_created_at: expect.any(String),
          article_title: expect.any(String),
          article_topic: expect.any(String),
          article_body: expect.any(String),
          articles_created_at: expect.any(String),
          article_votes: expect.any(Number),
          article_img_url: expect.any(String),
        };

        // Ensure each object has the correct keys
        body.commentsByUser.forEach((comment) => {
          expect(comment).toMatchObject(expectedCommentStructure);
        });

        expect(body.commentCount).toBe(5);
        expect(body.articleCount).toBe(4);
      });
  });
  test("200 status code and correct response object for user getting their account information when their account is set to private", async () => {
    await db.query(
      "UPDATE users SET is_private = true WHERE username = 'butter_bridge'"
    );

    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .get("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(5);
        expect(body.userInformation).toEqual({
          name: "jonny",
          username: "butter_bridge",
          role: "user",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });

        expect(body.articlesByUser).toHaveLength(4);

        expect(body.articlesByUser).toBeSortedBy("created_at", {
          descending: true,
        });

        const expectedArticleStructure = {
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
        };

        // Ensure each object has the correct keys
        body.articlesByUser.forEach((article) => {
          expect(article).toMatchObject(expectedArticleStructure);
        });

        expect(body.commentsByUser).toHaveLength(5);

        expect(body.commentsByUser).toBeSortedBy("comment_created_at", {
          descending: true,
        });

        const expectedCommentStructure = {
          comment_id: expect.any(Number),
          article_id: expect.any(Number),
          comment_body: expect.any(String),
          comment_author: "butter_bridge",
          comment_votes: expect.any(Number),
          comment_created_at: expect.any(String),
          article_title: expect.any(String),
          article_topic: expect.any(String),
          article_body: expect.any(String),
          articles_created_at: expect.any(String),
          article_votes: expect.any(Number),
          article_img_url: expect.any(String),
        };

        // Ensure each object has the correct keys
        body.commentsByUser.forEach((comment) => {
          expect(comment).toMatchObject(expectedCommentStructure);
        });

        expect(body.commentCount).toBe(5);
        expect(body.articleCount).toBe(4);
      });
  });
  test("200 status code and correct response object for admin getting their information", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .get(`/api/users/${loginObj.username}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(5);
        expect(body.userInformation).toEqual({
          name: "Admin User",
          username: `${loginObj.username}`,
          role: "admin",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/4919/4919646.png",
        });

        expect(body.articlesByUser).toHaveLength(0);

        expect(body.commentsByUser).toHaveLength(0);

        expect(body.commentCount).toBe(0);
        expect(body.articleCount).toBe(0);
      });
  });
  test("200 status code and correct response object for admin getting a user's information", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .get("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(5);
        expect(body.userInformation).toEqual({
          name: "jonny",
          username: "butter_bridge",
          role: "user",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });

        expect(body.articlesByUser).toHaveLength(4);

        expect(body.articlesByUser).toBeSortedBy("created_at", {
          descending: true,
        });

        const expectedArticleStructure = {
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
        };

        // Ensure each object has the correct keys
        body.articlesByUser.forEach((article) => {
          expect(article).toMatchObject(expectedArticleStructure);
        });

        expect(body.commentsByUser).toHaveLength(5);

        expect(body.commentsByUser).toBeSortedBy("comment_created_at", {
          descending: true,
        });

        const expectedCommentStructure = {
          comment_id: expect.any(Number),
          article_id: expect.any(Number),
          comment_body: expect.any(String),
          comment_author: "butter_bridge",
          comment_votes: expect.any(Number),
          comment_created_at: expect.any(String),
          article_title: expect.any(String),
          article_topic: expect.any(String),
          article_body: expect.any(String),
          articles_created_at: expect.any(String),
          article_votes: expect.any(Number),
          article_img_url: expect.any(String),
        };

        // Ensure each object has the correct keys
        body.commentsByUser.forEach((comment) => {
          expect(comment).toMatchObject(expectedCommentStructure);
        });

        expect(body.commentCount).toBe(5);
        expect(body.articleCount).toBe(4);
      });
  });
  test("200 status code and correct response object for admin getting a user's information if user is set to private", async () => {
    await db.query(
      "UPDATE users SET is_private = true WHERE username = 'butter_bridge'"
    );
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };
    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .get("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then(({ body }) => {
        expect(Object.keys(body).length).toBe(5);
        expect(body.userInformation).toEqual({
          name: "jonny",
          username: "butter_bridge",
          role: "user",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });

        expect(body.articlesByUser).toHaveLength(4);

        expect(body.articlesByUser).toBeSortedBy("created_at", {
          descending: true,
        });

        const expectedArticleStructure = {
          article_id: expect.any(Number),
          title: expect.any(String),
          topic: expect.any(String),
          author: "butter_bridge",
          body: expect.any(String),
          created_at: expect.any(String),
          article_img_url: expect.any(String),
          votes: expect.any(Number),
        };

        // Ensure each object has the correct keys
        body.articlesByUser.forEach((article) => {
          expect(article).toMatchObject(expectedArticleStructure);
        });

        expect(body.commentsByUser).toHaveLength(5);

        expect(body.commentsByUser).toBeSortedBy("comment_created_at", {
          descending: true,
        });

        const expectedCommentStructure = {
          comment_id: expect.any(Number),
          article_id: expect.any(Number),
          comment_body: expect.any(String),
          comment_author: "butter_bridge",
          comment_votes: expect.any(Number),
          comment_created_at: expect.any(String),
          article_title: expect.any(String),
          article_topic: expect.any(String),
          article_body: expect.any(String),
          articles_created_at: expect.any(String),
          article_votes: expect.any(Number),
          article_img_url: expect.any(String),
        };

        // Ensure each object has the correct keys
        body.commentsByUser.forEach((comment) => {
          expect(comment).toMatchObject(expectedCommentStructure);
        });

        expect(body.commentCount).toBe(5);
        expect(body.articleCount).toBe(4);
      });
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
      .get("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 401 response when user attemps to access the endpoint for an account which doesnt exist in users table", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .get("/api/users/notauser")
      .set("Authorization", `Bearer ${token}`)
      .expect(401);

    expect(errorResponse.body.message).toBe("User not found");
  });
  test("Correct 403 response when user attempts to access the endpoint for another account which has been deleted", async () => {
    const adminLoginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };

    const adminLoginResponse = await request(app)
      .post("/api/users/login")
      .send(adminLoginObj);

    const adminToken = adminLoginResponse.body.token;

    await request(app)
      .delete("/api/users/lurker")
      .set("Authorization", `Bearer ${adminToken}`);

    const userLoginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const userLoginResponse = await request(app)
      .post("/api/users/login")
      .send(userLoginObj);

    const userToken = userLoginResponse.body.token;

    const errorResponse = await request(app)
      .get("/api/users/lurker")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 403 response when user attempts to access the endpoint for another account which is private", async () => {
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
