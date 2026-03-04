import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
  resetPassword,
} from "../controllers/authControllers";

const userRouter = Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/forgot-password").post(forgotPassword);
userRouter.route("/reset-password").post(resetPassword);

export default userRouter;
