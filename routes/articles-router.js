const {
  getArticles,
  getArticleById,
  postArticle,
  patchArticleById,
  deleteArticleById,
} = require("../controllers/articles.controller");

const { authenticateUser } = require("../middleware/auth");

const articlesRouter = require("express").Router();

articlesRouter
  .route("/")
  .get(getArticles)
  .post(authenticateUser("user"), postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(authenticateUser("user"), patchArticleById)
  .delete(authenticateUser("user"), deleteArticleById);

module.exports = articlesRouter;
