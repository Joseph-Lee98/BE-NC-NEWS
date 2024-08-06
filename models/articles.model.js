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
