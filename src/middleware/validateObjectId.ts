import { RequestHandler } from "express";
import mongoose from "mongoose";
import AppError from "../utils/AppError";

const validateObjectId: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    next(new AppError(`Invalid object id: ${req.params.id}`, 400));
    return;
  }

  next();
};

export default validateObjectId;
