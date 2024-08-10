const { removeCommentByCommentId } = require("../models/comments.model");

exports.deleteCommentByCommentId = async (req, res, next) => {
  const { comment_id } = req.params;
  const formattedComment_id = Number(comment_id);

  if (!Number.isInteger(formattedComment_id) || formattedComment_id < 1) {
    return res
      .status(400)
      .send({ message: "comment_id must be a valid, positive integer" });
  }

  try {
    await removeCommentByCommentId(formattedComment_id, req.user.username);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
