const {
  deleteCommentByCommentId,
  patchCommentByCommentId,
} = require("../controllers/comments.controller");

const { authenticateUser } = require("../middleware/auth");

const commentsRouter = require("express").Router();

commentsRouter
  .route("/:comment_id")
  .delete(authenticateUser("user"), deleteCommentByCommentId)
  .patch(authenticateUser("user"), patchCommentByCommentId);

module.exports = commentsRouter;
