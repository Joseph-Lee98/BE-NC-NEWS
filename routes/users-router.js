import { Router } from "express";
import { registerUser, loginUser } from "../controllers/users.controller";
import { preventLoggedInUser } from "../middleware/auth";

export const usersRouter = Router();

usersRouter.route("/").post(registerUser);

usersRouter.route("/login").post(preventLoggedInUser, loginUser);
