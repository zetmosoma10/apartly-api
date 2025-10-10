import multer from "multer";
import { User } from "./entities/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      file?: multer.File;
    }
  }
}
