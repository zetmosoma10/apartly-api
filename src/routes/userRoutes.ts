import { Router } from "express";
import { getLoginUser } from "../controllers/userControllers";

const userRouter = Router();

userRouter.route("/me").get(getLoginUser);

export default userRouter;
