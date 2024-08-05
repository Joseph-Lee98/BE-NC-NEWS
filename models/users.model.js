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

exports.fetchUser = async (username) => {
  const fullUserInformation = {};

  const userInformation = await db.query(
    "SELECT username,name,avatar_url,role FROM users WHERE username = $1 AND deleted_at IS NULL",
    [username]
  );

  fullUserInformation.userInformation = userInformation.rows[0];

  const articlesByUser = await db.query(
    "SELECT title,topic,author,body,created_at,votes,article_img_url FROM articles WHERE author = $1 ORDER BY created_at DESC",
    [username]
  );

  fullUserInformation.articlesByUser = articlesByUser.rows;

  const commentsByUser = await db.query(
    "SELECT comments.body AS comment_body,comments.author AS comment_author,comments.votes AS comment_votes,comments.created_at AS comment_created_at,articles.title AS article_title,articles.topic AS article_topic,articles.body AS article_body,articles.created_at AS articles_created_at,articles.votes AS article_votes,articles.article_img_url FROM comments JOIN articles ON articles.article_id = comments.article_id WHERE comments.author = $1 ORDER BY comments.created_at DESC",
    [username]
  );

  fullUserInformation.commentsByUser = commentsByUser.rows;

  const commentCount = await db.query(
    "SELECT COUNT(comment_id) AS comment_count FROM comments WHERE author = $1",
    [username]
  );
  fullUserInformation.commentCount = parseInt(
    commentCount.rows[0].comment_count,
    10
  );

  const articleCount = await db.query(
    "SELECT COUNT(article_id) AS article_count FROM articles WHERE author = $1",
    [username]
  );
  fullUserInformation.articleCount = parseInt(
    articleCount.rows[0].article_count,
    10
  );

  return fullUserInformation;
};

exports.updateUser = async (
  currentUsername,
  updatedUsername,
  name,
  password,
  avatar_url,
  is_private
) => {
  const client = await db.connect();
  let updatedUser;

  try {
    await client.query("BEGIN");
    if (updatedUsername) {
      const usernameCheck = await client.query(
        "SELECT username FROM users WHERE username = $1",
        [updatedUsername]
      );
      if (usernameCheck.rowCount > 0) {
        const error = new Error("Username already taken");
        error.status = 409;
        throw error;
      }
      // Update the username in the users table
      const updatedUsernameResult = await client.query(
        "UPDATE users SET username = $1 WHERE username = $2 RETURNING username,name,avatar_url,role",
        [updatedUsername, currentUsername]
      );

      //     // Update the username in the comments table
      await client.query("UPDATE comments SET author = $1 WHERE author = $2", [
        updatedUsername,
        currentUsername,
      ]);

      //     // Update the username in the articles table
      await client.query("UPDATE articles SET author = $1 WHERE author = $2", [
        updatedUsername,
        currentUsername,
      ]);
      currentUsername = updatedUsername;
      updatedUser = updatedUsernameResult.rows[0];
    }
    // Start building the update statement
    const updateFields = [];
    const values = [];

    // Conditionally add fields to update
    if (name !== undefined) {
      updateFields.push("name = $1");
      values.push(name);
    }
    if (password !== undefined) {
      updateFields.push("password = $" + (values.length + 1));
      const hashedPassword = await hashPassword(password);
      values.push(hashedPassword);
    }
    if (avatar_url !== undefined) {
      updateFields.push("avatar_url = $" + (values.length + 1));
      values.push(avatar_url);
    }
    if (is_private !== undefined) {
      updateFields.push("is_private = $" + (values.length + 1));
      values.push(is_private);
    }

    // If there are fields to update, construct and execute the update query
    if (updateFields.length > 0) {
      const queryStr = `UPDATE users SET ${updateFields.join(
        ", "
      )} WHERE username = $${
        values.length + 1
      } RETURNING username,name,role,avatar_url`;
      values.push(currentUsername); // Add the current username for the WHERE clause

      const updatedUserResult = await client.query(queryStr, values);
      updatedUser = updatedUserResult.rows[0];
    }
    await client.query("COMMIT");
    return updatedUser; // Return the updated user record
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
