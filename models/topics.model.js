const db = require("../db/connection");

exports.fetchTopics = async (req, res, next) => {
  const topics = await db.query("SELECT * FROM topics");
  return topics.rows;
};
