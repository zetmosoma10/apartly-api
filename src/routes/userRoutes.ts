import { Router } from "express";
import {
  getLoginUser,
  updateMe,
  deleteAccount,
  uploadAvatar,
} from "../controllers/userControllers";
import { protectRoute } from "../middleware/protectRouteHandlers";
import { uploadAvatarImage } from "../configs/multer";

const userRouter = Router();

userRouter
  .route("/me")
  .get(protectRoute, getLoginUser)
  .patch(protectRoute, updateMe)
  .post(protectRoute, deleteAccount);

userRouter
  .route("/me/avatar")
  .patch(protectRoute, uploadAvatarImage, uploadAvatar);

export default userRouter;
