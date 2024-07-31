const request = require("supertest");
const app = require("../../../app");
const db = require("../../../db/connection");
const seed = require("../../../db/seeds/seed");
const testData = require("../../../db/data/test-data");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("POST /api/users/login", () => {
  test("Logs in as user and returns the user object and token", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual({
          name: "jonny",
          username: "butter_bridge",
          role: "user",
          avatar_url:
            "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
        });
        expect(body.token).toBeDefined();
        expect(typeof body.token).toBe("string");
        expect(body.token).not.toBe("");
      });
  });

  test("Logs in as admin and returns the admin user object and token", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200)
      .then(({ body }) => {
        expect(body.user).toEqual({
          name: "Admin User",
          username: process.env.ADMIN_USERNAME,
          role: "admin",
          avatar_url: "https://cdn-icons-png.flaticon.com/512/4919/4919646.png",
        });
        expect(body.token).toBeDefined();
        expect(typeof body.token).toBe("string");
        expect(body.token).not.toBe("");
      });
  });

  test("401 when logging in as admin with invalid password", async () => {
    const loginObj = {
      username: process.env.ADMIN_USERNAME,
      password: "wrong password",
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid credentials");
      });
  });

  test("401 when logging in as user with invalid username", async () => {
    const loginObj = {
      username: "butterbridge",
      password: "P@ssw0rd_Br1dge!",
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid credentials");
      });
  });

  test("401 when logging in with empty username", async () => {
    const loginObj = {
      username: "",
      password: "P@ssw0rd_Br1dge!",
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(401)
      .then(({ body }) => {
        expect(body.message).toBe("Invalid credentials");
      });
  });

  test("400 when logging in without username", async () => {
    const loginObj = {
      password: "P@ssw0rd_Br1dge!",
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username and password are required");
      });
  });

  test("400 when logging in without password", async () => {
    const loginObj = {
      username: "butter_bridge",
    };

    await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username and password are required");
      });
  });

  test("400 when logging in whilst already logged in by having a valid JSON web token in request header", async () => {
    const loginObj = {
      username: "butter_bridge",
      password: "P@ssw0rd_Br1dge!",
    };

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send(loginObj)
      .expect(200);

    const token = loginResponse.body.token;

    await request(app)
      .post("/api/users/login")
      .set("Authorization", `Bearer ${token}`)
      .send(loginObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Already logged in");
      });
  });
});
