import { Router } from "express";
import {
  register,
  login,
  forgotPassword,
} from "../controllers/authControllers";

const userRouter = Router();

userRouter.route("/register").post(register);
userRouter.route("/login").post(login);
userRouter.route("/forgot-password").post(forgotPassword);

export default userRouter;
