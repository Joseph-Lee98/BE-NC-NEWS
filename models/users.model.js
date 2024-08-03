const db = require("../db/connection");
const { hashPassword } = require("../utils/seedUtils");
const bcrypt = require("bcrypt");

exports.createUser = async (username, name, password, avatar_url) => {
  const userMatch = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  if (userMatch.rowCount) {
    const error = new Error("Username already taken");
    error.status = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const insertValues = [username, name, hashedPassword];

  if (avatar_url) insertValues.push(avatar_url);

  const query = `INSERT INTO users (username,name,password${
    avatar_url ? ",avatar_url" : ""
  }) VALUES ($1,$2,$3${avatar_url ? ",$4" : ""}) RETURNING *`;

  const result = await db.query(query, insertValues);

  return result.rows[0];
};

exports.verifyUser = async (username, password) => {
  const result = await db.query(
    "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
    [username]
  );
  const user = result.rows[0];
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  return null;
};

exports.removeUser = async (username) => {
  const client = await db.connect();

  try {
    // Start a transaction
    await client.query("BEGIN");

    // Update the users table
    await client.query(
      "UPDATE users SET deleted_at = NOW() WHERE username = $1",
      [username]
    );

    // Update the comments table to set the author to NULL
    await client.query("UPDATE comments SET author = NULL WHERE author = $1", [
      username,
    ]);

    // Update the articles table to set the author to NULL
    await client.query("UPDATE articles SET author = NULL WHERE author = $1", [
      username,
    ]);

    // Commit the transaction
    await client.query("COMMIT");
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query("ROLLBACK");
    throw error;
  } finally {
    // Release the client back to the pool
    client.release();
  }
};

exports.getUserByUsername = async (username) => {
  const usernameQueryResult = await db.query(
    "SELECT * FROM users WHERE username = $1 AND deleted_at IS NULL",
    [username]
  );
  return usernameQueryResult.rowCount;
};
