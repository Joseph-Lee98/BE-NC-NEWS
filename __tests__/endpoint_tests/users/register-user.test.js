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

describe("POST /api/users", () => {
  test("Registers the user, logs in the user and returns the user object and token", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      password: "oneD0esN!tSimPly!",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(201)
      .then(({ body }) => {
        expect(body.user).toEqual({
          name: "Sean",
          username: "Boromir",
          role: "user",
          avatar_url:
            "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
        });
        expect(body.token).toBeDefined();
        expect(typeof body.token).toBe("string");
        expect(body.token).not.toBe("");
      });
    const usersTable = await db.query("SELECT * FROM users");
    expect(usersTable.rows).toHaveLength(6);
  });
  test("409 when registering with a username that belonged to an inactive user", async () => {
    const registerObj = {
      username: "banana",
      password: "oneD0esN!tSimPly!",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(409)
      .then(({ body }) => {
        expect(body.message).toBe("Username already taken");
      });
  });
  test("400 when registering without a password", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username, password and name are required");
      });
  });
  test("400 when registering without a username", async () => {
    const registerObj = {
      password: "oneD0esN!tSimPly!",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username, password and name are required");
      });
  });
  test("400 when registering without a name", async () => {
    const registerObj = {
      username: "Boromir",
      password: "oneD0esN!tSimPly!",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username, password and name are required");
      });
  });
  test("400 when registering with an invalid avatar_url", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      avatar_url: 5,
      password: "password",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "URL to avatar image must be in a valid format"
        );
      });
  });
  test("400 when registering with an invalid password", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      password: 5,
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Password must be in a valid format");
      });
  });
  test("400 when registering with an invalid username", async () => {
    const registerObj = {
      password: "oneD0esN!tSimPly!",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      username: 5,
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username must be in a valid format");
      });
  });
  test("400 when registering with an invalid name", async () => {
    const registerObj = {
      username: "Boromir",
      password: "oneD0esN!tSimPly!",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      name: 5,
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Name must be in a valid format");
      });
  });

  test("400 when registering with an empty avatar img url", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      avatar_url: "",
      password: "password",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("URL to avatar image must not be empty text");
      });
  });
  test("400 when registering with an empty password", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      password: "",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Password must not be empty text");
      });
  });
  test("400 when registering with an empty username", async () => {
    const registerObj = {
      password: "oneD0esN!tSimPly!",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      username: "",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Username must not be empty text");
      });
  });
  test("400 when registering with an empty name", async () => {
    const registerObj = {
      username: "Boromir",
      password: "oneD0esN!tSimPly!",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      name: "",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Name must not be empty text");
      });
  });

  test("400 when registering with a password that is too long in length", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      password: "abcdefghijklmnopqrstuvwxyzboromir",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "Password must not be greater than 30 characters in length"
        );
      });
  });
  test("400 when registering with a username that is too long in length", async () => {
    const registerObj = {
      password: "oneD0esN!tSimPly!",
      name: "Sean",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      username: "abcdefghijklmnopqrstuvwxyz",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "Username must not be greater than 20 characters in length"
        );
      });
  });
  test("400 when registering with a name that is too long in length", async () => {
    const registerObj = {
      username: "Boromir",
      password: "oneD0esN!tSimPly!",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
      name: "abcdefghijklmnopqrstuvwxyzboromir",
    };

    await request(app)
      .post("/api/users")
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe(
          "Name must not be greater than 30 characters in length"
        );
      });
  });

  test("400 when registering whilst already logged in by having a valid JSON web token in request header", async () => {
    const registerObj = {
      username: "Boromir",
      name: "Sean",
      password: "oneD0esN!tSimPly!",
      avatar_url:
        "https://lisasoddthoughts.com/wp-content/uploads/2021/01/lord-of-the-rings-sean-bean-boromir-1584636601-1200x675.jpg",
    };

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
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send(registerObj)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Already logged in");
      });
  });
});
