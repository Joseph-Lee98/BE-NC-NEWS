const {
  registerUser,
  loginUser,
  deleteUser,
  getUser,
  patchUser,
} = require("../controllers/users.controller");
const {
  preventLoggedInUser,
  authenticateUser,
  authenticateUserForUserInformation,
} = require("../middleware/auth");

const usersRouter = require("express").Router();

usersRouter.route("/").post(preventLoggedInUser, registerUser);

usersRouter.route("/login").post(preventLoggedInUser, loginUser);

usersRouter
  .route("/:username")
  .delete(authenticateUser("user"), deleteUser)
  .get(authenticateUserForUserInformation(), getUser)
  .patch(authenticateUser("user"), patchUser);

module.exports = usersRouter;
