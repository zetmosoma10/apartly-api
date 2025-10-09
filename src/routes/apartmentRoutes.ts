import { Router } from "express";
import {
  createApartment,
  getAllApartments,
  getApartment,
  updateApartment,
  deleteApartment,
} from "../controllers/apartmentControllers";
import uploadApartmentImages from "../configs/multer";
import protectRoute from "../middleware/protectRouteHandlers";

const router = Router();

router
  .route("/")
  .post(protectRoute, uploadApartmentImages, createApartment)
  .get(getAllApartments);

router
  .route("/:id")
  .get(getApartment)
  .patch(protectRoute, updateApartment)
  .delete(protectRoute, deleteApartment);

export default router;
