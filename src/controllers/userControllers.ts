import { RequestHandler } from "express";
import User from "../models/User";
import AppError from "../utils/AppError";
import getUserFields from "../utils/getUserFields";
import _ from "lodash";
import mongoose from "mongoose";
import Apartment from "../models/Apartment";

export const getLoginUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      next(new AppError("User not found.", 404));
      return;
    }

    const editedUser = _.pick(user, getUserFields());

    res.status(200).send({
      success: true,
      results: editedUser,
    });
  } catch (error) {
    next(error);
  }
};
