const db = require("../db/connection");
const { hashPassword } = require("../utils/seedUtils");
const bcrypt = require("bcrypt");

exports.createUser = async (username, name, password, avatar_url) => {
  const deletedUserMatch = await db.query(
    "SELECT * FROM deletedUsers WHERE username = $1",
    [username]
  );
  if (deletedUserMatch.rowCount) {
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
  // if (result.rows.length === 0) {
  //   const error = new Error("Registration failed");
  //   error.status = 400;
  //   throw error;
  // }
  return result.rows[0];
};

exports.verifyUser = async (username, password) => {
  const result = await db.query("SELECT * FROM users WHERE username = $1", [
    username,
  ]);
  const user = result.rows[0];
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  return null;
};
