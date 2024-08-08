const {
  fetchArticles,
  fetchArticleById,
  createArticle,
  updateArticleById,
  removeArticleById,
} = require("../models/articles.model");
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

exports.postArticle = async (req, res, next) => {
  const { title, body, topic, article_img_url } = req.body;
  const { username } = req.user;
  if (title === undefined || topic === undefined || body === undefined)
    return res
      .status(400)
      .send({ message: "Title, body and topic are required" });

  if (typeof title !== "string")
    return res.status(400).send({ message: "Title must be in a valid format" });
  if (title.length === 0 || title.trim().length === 0)
    return res.status(400).send({ message: "Title must not be empty text" });
  if (title.length > 200)
    return res.status(400).send({
      message: "Title must not be greater than 200 characters in length",
    });

  if (typeof body !== "string")
    return res
      .status(400)
      .send({ message: "Article body must be in a valid format" });
  if (body.length === 0 || body.trim().length === 0)
    return res
      .status(400)
      .send({ message: "Article body must not be empty text" });
  if (body.length > 5000)
    return res.status(400).send({
      message:
        "Article body must not be greater than 5000 characters in length",
    });

  if (article_img_url !== undefined) {
    if (typeof article_img_url !== "string")
      return res
        .status(400)
        .send({ message: "URL to article image must be in a valid format" });
    if (article_img_url.length === 0 || article_img_url.trim().length === 0)
      return res
        .status(400)
        .send({ message: "URL to article image must not be empty text" });
  }

  try {
    const topics = await fetchTopics();
    const topicSlugs = topics.map((topic) => topic.slug);
    if (!topicSlugs.includes(topic))
      return res.status(400).send({ message: "Topic must be a valid topic" });

    const postedArticle = await createArticle(
      title,
      body,
      topic,
      article_img_url,
      username
    );
    return res.status(201).send(postedArticle);
  } catch (error) {
    next(error);
  }
};

exports.patchArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  const formattedArticle_id = Number(article_id);

  if (inc_votes === undefined)
    return res.status(400).send({ message: "Inc_votes is required" });

  if (!Number.isInteger(formattedArticle_id) || formattedArticle_id < 1) {
    return res
      .status(400)
      .send({ message: "article_id must be a valid, positive integer" });
  }

  if (inc_votes !== 1 && inc_votes !== -1)
    return res.status(400).send({ message: "inc_votes must be +1 or -1" });
  try {
    const article = await fetchArticleById(formattedArticle_id);
    const new_votes = article.votes + inc_votes;
    const updatedArticle = await updateArticleById(
      formattedArticle_id,
      new_votes
    );
    return res.status(200).send(updatedArticle);
  } catch (error) {
    next(error);
  }
};

exports.deleteArticleById = async (req, res, next) => {
  const { article_id } = req.params;
  const formattedArticle_id = Number(article_id);
  if (!Number.isInteger(formattedArticle_id) || formattedArticle_id < 1) {
    return res
      .status(400)
      .send({ message: "article_id must be a valid, positive integer" });
  }
  try {
    const selectedArticle = await fetchArticleById(formattedArticle_id);
    if (
      selectedArticle.author !== req.user.username &&
      req.user.role !== "admin"
    )
      return res.status(403).send({ message: "Forbidden" });
    const isArticleDeleted = await removeArticleById(formattedArticle_id);
    return isArticleDeleted
      ? res.status(204).send()
      : res.status(404).send({ message: "Article not found" });
  } catch (error) {
    next(error);
  }
};
