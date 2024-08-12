const request = require("supertest");
const app = require("../../../app");
const db = require("../../../db/connection");
const seed = require("../../../db/seeds/seed");
const testData = require("../../../db/data/test-data");
const bcrypt = require("bcrypt");

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

describe("PATCH /api/users/:username", () => {
  test("Responds with 200 code and correct updated user object in response body when user updates their username", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;
    const updatedUsername = "newName";

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send({ updatedUsername })
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "newName",
      name: "jonny",
      role: "user",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    });

    const updatedUser = await db.query(
      "SELECT username,name,role,avatar_url FROM users WHERE username = $1",
      [updatedUsername]
    );
    expect(updatedUser.rows[0]).toEqual({
      username: "newName",
      name: "jonny",
      role: "user",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    });

    const oldUsername = "butter_bridge";

    const oldUsernameUser = await db.query(
      "SELECT username,name,role,avatar_url FROM users WHERE username = $1",
      [oldUsername]
    );
    expect(oldUsernameUser.rowCount).toBe(0);

    const oldUsernameArticles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [oldUsername]
    );
    expect(oldUsernameArticles.rowCount).toBe(0);

    const oldUsernameComments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [oldUsername]
    );
    expect(oldUsernameComments.rowCount).toBe(0);

    const updatedUsernameArticles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [updatedUsername]
    );
    expect(updatedUsernameArticles.rowCount).toBe(4);

    const updatedUsernameComments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [updatedUsername]
    );
    expect(updatedUsernameComments.rowCount).toBe(5);
  });
  test("Responds with 200 code and correct updated user object in response body when user updates their name", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;
    const updatedName = "james";

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: `${updatedName}` })
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "butter_bridge",
      name: "james",
      role: "user",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    });

    const username = "butter_bridge";

    const updatedUser = await db.query(
      "SELECT username,name,role,avatar_url FROM users WHERE username = $1",
      [username]
    );
    expect(updatedUser.rows[0]).toEqual({
      username: "butter_bridge",
      name: "james",
      role: "user",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    });
  });
  test("Responds with 200 code and correct updated user object in response body when user updates their password", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send({ password: "newPassword" })
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "butter_bridge",
      name: "jonny",
      role: "user",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    });

    const username = "butter_bridge";

    const hashedPassword = await db.query(
      "SELECT password FROM users where username = $1",
      [username]
    );

    const isPasswordUpdated = await bcrypt.compare(
      "newPassword",
      hashedPassword.rows[0].password
    );

    expect(isPasswordUpdated).toBe(true);
  });
  test("Responds with 200 code and correct updated user object in response body when user updates their avatar_url", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send({
        avatar_url:
          "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      })
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "butter_bridge",
      name: "jonny",
      role: "user",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
    });

    const username = "butter_bridge";

    const updatedUser = await db.query(
      "SELECT username,name,role,avatar_url FROM users WHERE username = $1",
      [username]
    );
    expect(updatedUser.rows[0]).toEqual({
      username: "butter_bridge",
      name: "jonny",
      role: "user",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
    });
  });
  test("Responds with 200 code and correct updated user object in response body when user updates their privacy details", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send({
        is_private: true,
      })
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "butter_bridge",
      name: "jonny",
      role: "user",
      avatar_url:
        "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    });

    const username = "butter_bridge";

    const updatedUser = await db.query(
      "SELECT is_private FROM users WHERE username = $1",
      [username]
    );
    expect(updatedUser.rows[0].is_private).toBe(true);
  });
  test("Responds with 200 code and correct updated user object in response body when user updates all possible properties for their account", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;
    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "newName",
      name: "james",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      role: "user",
    });

    const updatedUser = await db.query(
      "SELECT username,name,role,avatar_url,is_private FROM users WHERE username = $1",
      [patchBody.updatedUsername]
    );
    expect(updatedUser.rows[0]).toEqual({
      username: "newName",
      name: "james",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
      role: "user",
    });

    const oldUsername = "butter_bridge";

    const oldUsernameUser = await db.query(
      "SELECT username,name,role,avatar_url FROM users WHERE username = $1",
      [oldUsername]
    );
    expect(oldUsernameUser.rowCount).toBe(0);

    const oldUsernameArticles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [oldUsername]
    );
    expect(oldUsernameArticles.rowCount).toBe(0);

    const oldUsernameComments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [oldUsername]
    );
    expect(oldUsernameComments.rowCount).toBe(0);

    const updatedUsernameArticles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [patchBody.updatedUsername]
    );
    expect(updatedUsernameArticles.rowCount).toBe(4);

    const updatedUsernameComments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [patchBody.updatedUsername]
    );
    expect(updatedUsernameComments.rowCount).toBe(5);

    const hashedPassword = await db.query(
      "SELECT password FROM users where username = $1",
      [patchBody.updatedUsername]
    );

    const isPasswordUpdated = await bcrypt.compare(
      "newPassword",
      hashedPassword.rows[0].password
    );

    expect(isPasswordUpdated).toBe(true);
  });
  test("Responds with 200 code and correct updated user object in response body when admin updates all possible properties for a user account", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;
    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const updateResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(200);

    expect(updateResponse.body).toEqual({
      username: "newName",
      name: "james",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      role: "user",
    });

    const updatedUser = await db.query(
      "SELECT username,name,role,avatar_url,is_private FROM users WHERE username = $1",
      [patchBody.updatedUsername]
    );
    expect(updatedUser.rows[0]).toEqual({
      username: "newName",
      name: "james",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
      role: "user",
    });

    const oldUsername = "butter_bridge";

    const oldUsernameUser = await db.query(
      "SELECT username,name,role,avatar_url FROM users WHERE username = $1",
      [oldUsername]
    );
    expect(oldUsernameUser.rowCount).toBe(0);

    const oldUsernameArticles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [oldUsername]
    );
    expect(oldUsernameArticles.rowCount).toBe(0);

    const oldUsernameComments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [oldUsername]
    );
    expect(oldUsernameComments.rowCount).toBe(0);

    const updatedUsernameArticles = await db.query(
      "SELECT * FROM articles WHERE author = $1",
      [patchBody.updatedUsername]
    );
    expect(updatedUsernameArticles.rowCount).toBe(4);

    const updatedUsernameComments = await db.query(
      "SELECT * FROM comments WHERE author = $1",
      [patchBody.updatedUsername]
    );
    expect(updatedUsernameComments.rowCount).toBe(5);

    const hashedPassword = await db.query(
      "SELECT password FROM users where username = $1",
      [patchBody.updatedUsername]
    );

    const isPasswordUpdated = await bcrypt.compare(
      "newPassword",
      hashedPassword.rows[0].password
    );

    expect(isPasswordUpdated).toBe(true);
  });
  test("401 response with correct message when attempting to patch user details but not logged in", async () => {
    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .send(patchBody)
      .expect(401);

    expect(errorResponse.body.message).toBe("No token provided");
  });
  test("Correct 403 response when user attempts to access the endpoint but their account has been deleted", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .delete("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`);

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(403);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 401 response when admin attempts to access the endpoint for an account which doesnt exist in users table", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };

    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/notauser")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(401);

    expect(errorResponse.body.message).toBe("User not found");
  });
  test("Correct 401 response when admin attempts to access the endpoint for an account which has been deleted", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };

    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    await request(app)
      .delete("/api/users/lurker")
      .set("Authorization", `Bearer ${token}`);

    const errorResponse = await request(app)
      .patch("/api/users/lurker")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(401);

    expect(errorResponse.body.message).toBe("Account deleted");
  });
  test("Correct 403 response when user attempts to access the endpoint for another account ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = {
      updatedUsername: "newName",
      name: "james",
      password: "newPassword",
      avatar_url:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2021/03/William-Shatner-as-Admiral-Kirk-in-The-Wrath-of-Khan.jpg",
      is_private: true,
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/lurker")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(403);

    expect(errorResponse.body.message).toBe("Forbidden");
  });
  test("Correct 400 response when user attempts to access endpoint but request body is empty ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = {};

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Request body must contain at least one of the following fields: username, name, password, avatar_url, is_private."
    );
  });
  test("Correct 400 response when user attempts to access endpoint but request body doesnt contain any of the required properties ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { bestClub: "Manchester United" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Request body must contain at least one of the following fields: username, name, password, avatar_url, is_private."
    );
  });
  test("Correct 400 response when username is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { updatedUsername: true };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Username must be in a valid format"
    );
  });
  test("Correct 400 response when username is empty text", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { updatedUsername: " " };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe("Username must not be empty text");
  });
  test("Correct 400 response when username is too long", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { updatedUsername: "abcdefghijklmnopqrstuvwxyz" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Username must not be greater than 20 characters in length"
    );
  });
  test("Correct 400 response when name is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { name: true };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe("Name must be in a valid format");
  });
  test("Correct 400 response when name is empty text", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { name: "" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe("Name must not be empty text");
  });
  test("Correct 400 response when name is too long", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { name: "abcdefghijklmnopqrstuvwxyztoolong" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Name must not be greater than 30 characters in length"
    );
  });
  test("Correct 400 response when password is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { password: 5 };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Password must be in a valid format"
    );
  });
  test("Correct 400 response when password is empty text", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { password: "" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe("Password must not be empty text");
  });
  test("Correct 400 response when password is too long", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { password: "abcdefghijklmnopqrstuvwxyztoolong" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "Password must not be greater than 30 characters in length"
    );
  });
  test("Correct 400 response when avatar_url is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { avatar_url: 5 };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "URL to avatar image must be in a valid format"
    );
  });
  test("Correct 400 response when avatar_url is empty text", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { avatar_url: "" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "URL to avatar image must not be empty text"
    );
  });
  test("Correct 400 response when is_private is not in valid format ", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { is_private: 5 };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(400);

    expect(errorResponse.body.message).toBe(
      "is_private must be in a valid format"
    );
  });
  test("Correct 409 response when updating username but username is already taken", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const patchBody = { updatedUsername: "lurker" };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj);

    const token = loginResponse.body.token;

    const errorResponse = await request(app)
      .patch("/api/users/butter_bridge")
      .set("Authorization", `Bearer ${token}`)
      .send(patchBody)
      .expect(409);

    expect(errorResponse.body.message).toBe("Username already taken");
  });
});
