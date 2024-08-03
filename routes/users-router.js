const {
  registerUser,
  loginUser,
  deleteUser,
} = require("../controllers/users.controller");
const {
  preventLoggedInUser,
  checkRole,
  checkUser,
  checkUserStatus,
} = require("../middleware/auth");

const usersRouter = require("express").Router();

usersRouter.route("/").post(preventLoggedInUser, registerUser);

usersRouter.route("/login").post(preventLoggedInUser, loginUser);

usersRouter
  .route("/:username")
  .delete(checkUserStatus, checkRole("user"), checkUser, deleteUser);

module.exports = usersRouter;
