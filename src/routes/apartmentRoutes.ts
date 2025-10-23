import { Router } from "express";
import {
  createApartment,
  getAllApartments,
  getApartment,
  updateApartment,
  deleteApartment,
  rateApartment,
  getAllUserApartments,
  getFeatureApartments,
} from "../controllers/apartmentControllers";
import { uploadApartmentImages } from "../configs/multer";
import {
  protectRoute,
  authorizeRoute,
} from "../middleware/protectRouteHandlers";
import validateObjectId from "../middleware/validateObjectId";

const router = Router();

router
  .route("/")
  .post(protectRoute, authorizeRoute, uploadApartmentImages, createApartment)
  .get(getAllApartments);

router.route("/me").get(protectRoute, authorizeRoute, getAllUserApartments);
router.route("/features").get(getFeatureApartments);
router.route("/:id/rate").patch(protectRoute, rateApartment);

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

export default router;
