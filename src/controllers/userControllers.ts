import { RequestHandler } from "express";
import {
  deleteProfileSchema,
  updateMeSchema,
} from "../validations/userSchemas";
import mongoose from "mongoose";
import User from "../models/User";
import AppError from "../utils/AppError";
import getUserFields from "../utils/getUserFields";
import _ from "lodash";
import Apartment from "../models/Apartment";
import cloudinary from "../configs/cloudinary";

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
      next(new AppError("Invalid input(s)", 400, results.error.formErrors));
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

export const deleteAccount: RequestHandler = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // * Validate incoming password
    const { success, data, error} = deleteProfileSchema.safeParse(req.body);
    if (!success) {
      next(new AppError("Invalid input(s)", 400, error.formErrors));
      return;
    }

    const user = await User.findById(req.user?._id)
      .select("+password")
      .session(session);

    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    // * Check if incoming password is same as one in DB
    const passwordValid = await user.isPasswordsTheSame(data.password,user.password);
    if (!passwordValid) {
      next(new AppError("Incorrect password", 400));
      return;
    }

    // * If Landlord, delete related data
    if (user.role === "landlord") {
      const apartments = await Apartment.find({ landlord: user?._id }).session(
        session
      );

      const imagesEntries = apartments.map((a) => a.images);
      const images = imagesEntries.flat();

      // * Delete apartment images from cloudinary 
      await Promise.allSettled(
        images.map((img) => cloudinary.uploader.destroy(img.public_id))
      );

      // * Delete landlord apartments from DB
      await Apartment.deleteMany({ landlord: user._id }, { session });
    }

    // * If avatar exist, Delete it from cloudinary
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // * Delete User from DB
    await user?.deleteOne({ session });
    
    await session.commitTransaction();

    res.status(200).send({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
    console.log(error);
  } finally {
    await session.endSession();
  }
};
