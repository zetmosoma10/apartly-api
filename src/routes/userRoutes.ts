import { Router } from "express";
import {
  getLoginUser,
  updateMe,
  deleteAccount,
  uploadAvatar,
  deleteAvatar,
  getAllUsers,
} from "../controllers/userControllers";
import { protectRoute, adminRoute } from "../middleware/protectRouteHandlers";
import { uploadAvatarImage } from "../configs/multer";

const userRouter = Router();

userRouter.route("/").get(protectRoute, adminRoute, getAllUsers);

userRouter
  .route("/me")
  .get(protectRoute, getLoginUser)
  .patch(protectRoute, updateMe)
  .post(protectRoute, deleteAccount);

userRouter
  .route("/me/avatar")
  .patch(protectRoute, uploadAvatarImage, uploadAvatar)
  .delete(protectRoute, deleteAvatar);

export default userRouter;
