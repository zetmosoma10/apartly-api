import { Router } from "express";
import { register } from "../controllers/authControllers";

const userRouter = Router();

userRouter.route("/register").post(register);

export default userRouter;
