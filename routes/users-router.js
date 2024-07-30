const { registerUser, loginUser } = require("../controllers/users.controller");
const { preventLoggedInUser } = require("../middleware/auth");

const usersRouter = require("express").Router();

usersRouter.route("/").post(registerUser);

usersRouter.route("/login").post(preventLoggedInUser, loginUser);

module.exports = usersRouter;
