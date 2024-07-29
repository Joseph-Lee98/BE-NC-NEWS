const db = require("../db/connection");
const bcrypt = require("bcrypt");

exports.createUser = (req, res, next) => {};

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
