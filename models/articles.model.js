const db = require("../db/connection");

exports.fetchArticles = async ({ topic, sort_by, order_by }) => {
  let articlesQueryStr =
    "SELECT articles.article_id,title,topic,articles.author,articles.created_at,articles.votes,article_img_url,COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id";

  const queryParams = [];
  if (topic) {
    articlesQueryStr += ` WHERE topic = $1`;
    queryParams.push(topic);
  }
  articlesQueryStr += ` GROUP BY
   articles.article_id,
   title,
   topic,
   articles.author,
   articles.created_at,
   articles.votes,
   article_img_url`;

  if (sort_by && order_by) {
    articlesQueryStr += ` ORDER BY ${sort_by} ${order_by}`;
  } else articlesQueryStr += " ORDER BY created_at DESC";

  const articlesResult = await db.query(articlesQueryStr, queryParams);

  const formattedRows = articlesResult.rows.map((row) => ({
    ...row,
    comment_count: Number(row.comment_count),
  }));

  return formattedRows;
};

exports.fetchArticleById = async (article_id) => {
  const queryStr =
    "SELECT articles.article_id,articles.body,title,topic,articles.author,articles.created_at,articles.votes,article_img_url,COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id, title, topic, articles.author, articles.created_at, articles.votes, articles.body, article_img_url";
  const queryParams = [article_id];

  const articleResult = await db.query(queryStr, queryParams);
  if (!articleResult.rowCount) {
    const error = new Error("Article not found");
    error.status = 404;
    throw error;
  }

  const { comment_count, ...rest } = articleResult.rows[0];

  const formattedArticleResult = {
    ...rest,
    comment_count: Number(comment_count),
  };
  return formattedArticleResult;
};

exports.createArticle = async (title, body, topic, article_img_url, author) => {
  const queryParams = [title, body, topic, author];
  let columnNames = "title,body,topic,author";
  if (article_img_url !== undefined) {
    queryParams.push(article_img_url);
    columnNames += ",article_img_url";
  }
  const queryStr = `INSERT INTO articles (${columnNames}) VALUES ($1,$2,$3,$4${
    queryParams.length === 5 ? ",$5" : ""
  }) RETURNING *`;
  const postedArticle = await db.query(queryStr, queryParams);
  return postedArticle.rows[0];
};

exports.updateArticleById = async (article_id, new_votes) => {
  const queryParams = [new_votes, article_id];
  const queryStr =
    "UPDATE articles SET votes = $1 WHERE article_id = $2 RETURNING *";
  const updatedArticleResult = await db.query(queryStr, queryParams);
  return updatedArticleResult.rows[0];
};

exports.removeArticleById = async (article_id) => {
  const queryParams = [article_id];
  const queryStr = "DELETE FROM articles WHERE article_id = $1";
  const deletedArticle = await db.query(queryStr, queryParams);
  return deletedArticle.rowCount > 0;
};
