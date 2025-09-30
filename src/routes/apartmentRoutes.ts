import { Router } from "express";
import { createApartment } from "../controllers/apartmentControllers";
import uploadApartmentImages from "../configs/multer";

const router = Router();

router.route("/").post(uploadApartmentImages, createApartment);

export default router;
