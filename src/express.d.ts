import { Types } from "mongoose";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      userId?: Types.ObjectId;
      file?: multer.File;
    }
  }
}
