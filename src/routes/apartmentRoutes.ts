import { Router } from "express";
import {
  createApartment,
  getAllApartments,
  getApartment,
  updateApartment,
  deleteApartment,
  getAllUserApartments,
  getFeatureApartments,
  addOrUpdateComment,
  addOrUpdateRating,
  getAllUserRelatedApartments,
  deleteUserRelatedApartment,
} from "../controllers/apartmentControllers";
import { uploadApartmentImages } from "../configs/multer";
import {
  protectRoute,
  authorizeRoute,
  adminRoute,
} from "../middleware/protectRouteHandlers";
import validateObjectId from "../middleware/validateObjectId";

const router = Router();

router
  .route("/")
  .post(protectRoute, authorizeRoute, uploadApartmentImages, createApartment)
  .get(getAllApartments);

router.route("/me").get(protectRoute, authorizeRoute, getAllUserApartments);
router.route("/features").get(getFeatureApartments);

router
  .route("/:id/rating")
  .patch(protectRoute, validateObjectId, addOrUpdateRating);

router
  .route("/:id/comment")
  .patch(protectRoute, validateObjectId, addOrUpdateComment);

router
  .route("/:id")
  .get(validateObjectId, getApartment)
  .patch(
    protectRoute,
    authorizeRoute,
    validateObjectId,
    uploadApartmentImages,
    updateApartment
  )
  .delete(protectRoute, authorizeRoute, validateObjectId, deleteApartment);

// ? ADMIN
router
  .route("/:id/admin")
  .get(protectRoute, adminRoute, validateObjectId, getAllUserRelatedApartments);

router
  .route("/user/:id/admin")
  .delete(
    protectRoute,
    adminRoute,
    validateObjectId,
    deleteUserRelatedApartment
  );

export default router;
