const {
  getArticles,
  getArticleById,
} = require("../controllers/articles.controller");

const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles);

articlesRouter.route("/:article_id").get(getArticleById);

module.exports = articlesRouter;
