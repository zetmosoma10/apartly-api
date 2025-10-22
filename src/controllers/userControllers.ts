import { RequestHandler } from "express";
import User from "../models/User";
import AppError from "../utils/AppError";
import getUserFields from "../utils/getUserFields";
import _ from "lodash";
import { updateMeSchema } from "../validations/userSchemas";

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

export const updateMe: RequestHandler = async (req, res, next) => {
  try {
    if (req.body.password || req.body.role) {
      next(
        new AppError("Cannot update password or role in this endpoint", 400)
      );
      return;
    }

    const results = updateMeSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.format()));
      return;
    }

    const user = await User.findByIdAndUpdate(req.user?._id, results.data, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    res.status(200).send({
      success: true,
      results: user,
    });
  } catch (error) {
    next(error);
  }
};
