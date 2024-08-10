const {
  deleteCommentByCommentId,
} = require("../controllers/comments.controller");

const { authenticateUser } = require("../middleware/auth");

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:comment_id")
  .delete(authenticateUser("user"), deleteCommentByCommentId);

module.exports = commentsRouter;
