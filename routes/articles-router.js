const { getArticles } = require("../controllers/articles.controller");

const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getArticles);

module.exports = articlesRouter;
