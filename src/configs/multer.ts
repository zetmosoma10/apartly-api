import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, //10mb
  fileFilter(req, file, callback) {
    if (file.mimetype.startsWith("image/")) callback(null, true);
    else callback(null, false);
  },
});

const uploadApartmentImages = upload.array("images", 3);
const uploadAvatarImage = upload.single("avatar");

export { uploadApartmentImages, uploadAvatarImage };
