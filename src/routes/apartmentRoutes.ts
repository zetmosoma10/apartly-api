import { Router } from "express";
import {
  createApartment,
  getAllApartments,
  getApartment,
  updateApartment,
  deleteApartment,
  getAllUserApartments,
} from "../controllers/apartmentControllers";
import uploadApartmentImages from "../configs/multer";
import {
  protectRoute,
  authorizeRoute,
} from "../middleware/protectRouteHandlers";

const router = Router();

router
  .route("/")
  .post(protectRoute, authorizeRoute, uploadApartmentImages, createApartment)
  .get(getAllApartments);

router.route("/me").get(protectRoute, authorizeRoute, getAllUserApartments);

router
  .route("/:id")
  .get(getApartment)
  .patch(protectRoute, authorizeRoute, updateApartment)
  .delete(protectRoute, authorizeRoute, deleteApartment);

export default router;
