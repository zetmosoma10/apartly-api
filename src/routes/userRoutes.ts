import { Router } from "express";
import {
  getLoginUser,
  updateMe,
  deleteAccount,
} from "../controllers/userControllers";
import { protectRoute } from "../middleware/protectRouteHandlers";

const userRouter = Router();

userRouter
  .route("/me")
  .get(protectRoute, getLoginUser)
  .patch(protectRoute, updateMe)
  .post(protectRoute, deleteAccount);

export default userRouter;
