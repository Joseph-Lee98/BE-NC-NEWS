const {
  registerUser,
  loginUser,
  deleteUser,
  getUser,
} = require("../controllers/users.controller");
const { preventLoggedInUser, authenticateUser } = require("../middleware/auth");

const usersRouter = require("express").Router();

usersRouter.route("/").post(preventLoggedInUser, registerUser);

usersRouter.route("/login").post(preventLoggedInUser, loginUser);

usersRouter
  .route("/:username")
  .delete(authenticateUser("user"), deleteUser)
  .get(authenticateUser("user"), getUser);

module.exports = usersRouter;
