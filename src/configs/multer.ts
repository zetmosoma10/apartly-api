import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({ storage });

const uploadApartmentImages = upload.array("images", 8);

export default uploadApartmentImages;
