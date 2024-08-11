const db = require("../db/connection");

exports.removeCommentByCommentId = async (comment_id, author) => {
  const commentQueryParams = [comment_id];
  const commentQueryStr = "SELECT * FROM comments where comment_id = $1";
  const commentExists = await db.query(commentQueryStr, commentQueryParams);
  if (!commentExists.rowCount) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }
  const authorQueryParams = [author, comment_id];
  const authorQueryStr =
    "SELECT * FROM comments where author = $1 AND comment_id = $2";
  const authorWroteComment = await db.query(authorQueryStr, authorQueryParams);
  if (!authorWroteComment.rowCount && author !== process.env.ADMIN_USERNAME) {
    const error = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
  const deleteCommentQueryParams = [comment_id];
  const deleteCommentQueryStr = "DELETE FROM comments WHERE comment_id = $1";
  await db.query(deleteCommentQueryStr, deleteCommentQueryParams);
};

exports.updateCommentByCommentId = async (comment_id, inc_votes) => {
  const updateCommentParams = [inc_votes, comment_id];
  const updateCommentQueryStr =
    "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *";
  const updatedCommentResult = await db.query(
    updateCommentQueryStr,
    updateCommentParams
  );
  if (!updatedCommentResult.rowCount) {
    const error = new Error("Comment not found");
    error.status = 404;
    throw error;
  }
  return updatedCommentResult.rows[0];
};
