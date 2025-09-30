import { Router } from "express";
import {
  createApartment,
  getAllApartments,
  getApartment,
  updateApartment,
} from "../controllers/apartmentControllers";
import uploadApartmentImages from "../configs/multer";

const router = Router();

router
  .route("/")
  .post(uploadApartmentImages, createApartment)
  .get(getAllApartments);

router.route("/:id").get(getApartment).patch(updateApartment);

export default router;
