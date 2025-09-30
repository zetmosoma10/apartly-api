import { Router } from "express";
import {
  createApartment,
  getAllApartments,
} from "../controllers/apartmentControllers";
import uploadApartmentImages from "../configs/multer";

const router = Router();

router
  .route("/")
  .post(uploadApartmentImages, createApartment)
  .get(getAllApartments);

export default router;
