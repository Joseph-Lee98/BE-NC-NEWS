const { fetchArticles, fetchArticleById } = require("../models/articles.model");
const { fetchTopics } = require("../models/topics.model");

exports.getArticles = async (req, res, next) => {
  const { topic, sort_by, order_by } = req.query;
  const validSortColumns = ["votes", "comment_count", "created_at"];
  const validOrderDirections = ["asc", "desc"];
  if (topic) {
    try {
      const topics = await fetchTopics();
      const topicSlugs = topics.map((topic) => topic.slug);
      if (!topicSlugs.includes(topic))
        return res.status(400).send({ message: "Topic must be a valid topic" });
    } catch (error) {
      next(error);
    }
  }
  if (sort_by && !validSortColumns.includes(sort_by)) {
    return res.status(400).send({ message: "Invalid sort_by value" });
  }

  if (order_by && !validOrderDirections.includes(order_by)) {
    return res.status(400).send({ message: "Invalid order_by value" });
  }

  if (sort_by && !order_by) {
    return res.status(400).send({
      message: "Query must include an order_by if querying with a sort_by",
    });
  }

  if (!sort_by && order_by) {
    return res.status(400).send({
      message: "Query must include a sort_by if querying with an order_by",
    });
  }

  try {
    const articles = await fetchArticles(req.query);
    res.status(200).send(articles);
  } catch (error) {
    next(error);
  }
};

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;

  const formattedArticle_id = Number(article_id);

  if (!Number.isInteger(formattedArticle_id) || formattedArticle_id < 1) {
    return res
      .status(400)
      .send({ message: "article_id must be a valid, positive integer" });
  }

  try {
    const article = await fetchArticleById(formattedArticle_id);
    res.status(200).send(article);
  } catch (error) {
    next(error);
  }
};
