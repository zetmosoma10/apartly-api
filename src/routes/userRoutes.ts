import { Router } from "express";
import { getLoginUser, updateMe } from "../controllers/userControllers";
import { protectRoute } from "../middleware/protectRouteHandlers";

const userRouter = Router();

userRouter.route("/me").get(protectRoute, getLoginUser);
userRouter.route("/me/edit").patch(protectRoute, updateMe);

export default userRouter;
