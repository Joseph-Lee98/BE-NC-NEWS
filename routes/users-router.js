import { Router } from "express";
import { registerUser, loginUser } from "../controllers/users.controller";

export const usersRouter = Router();

usersRouter.route("/").post(registerUser);

usersRouter.route("/login").post(loginUser);
