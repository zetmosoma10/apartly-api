import { Router } from "express";
import {
  getLoginUser,
  updateMe,
  deleteAccount,
  uploadAvatar,
  deleteAvatar,
  getAllUsers,
  deleteUserAccount,
} from "../controllers/userControllers";
import { protectRoute, adminRoute } from "../middleware/protectRouteHandlers";
import { uploadAvatarImage } from "../configs/multer";
import validateObjectId from "../middleware/validateObjectId";

const userRouter = Router();

userRouter.route("/admin").get(protectRoute, adminRoute, getAllUsers);
userRouter
  .route("/:id/admin")
  .delete(protectRoute, adminRoute, validateObjectId, deleteUserAccount);

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
