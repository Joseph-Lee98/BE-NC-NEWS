const {
  removeCommentByCommentId,
  updateCommentByCommentId,
} = require("../models/comments.model");

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

exports.patchCommentByCommentId = async (req, res, next) => {
  const { inc_votes } = req.body;
  const { comment_id } = req.params;
  const formattedComment_id = Number(comment_id);

  if (inc_votes === undefined)
    return res.status(400).send({ message: "Inc_votes is required" });

  if (!Number.isInteger(formattedComment_id) || formattedComment_id < 1) {
    return res
      .status(400)
      .send({ message: "comment_id must be a valid, positive integer" });
  }

  if (inc_votes !== 1 && inc_votes !== -1)
    return res.status(400).send({ message: "inc_votes must be +1 or -1" });

  try {
    const updatedComment = await updateCommentByCommentId(
      formattedComment_id,
      inc_votes
    );
    return res.status(200).send(updatedComment);
  } catch (error) {
    next(error);
  }
};
