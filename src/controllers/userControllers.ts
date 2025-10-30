import { startSession } from "mongoose";
import { RequestHandler } from "express";
import {
  deleteProfileSchema,
  updateMeSchema,
} from "../validations/userSchemas";
import User from "../models/User";
import AppError from "../utils/AppError";
import getUserFields from "../utils/getUserFields";
import _ from "lodash";
import Apartment from "../models/Apartment";
import cloudinary from "../configs/cloudinary";
import streamUpload from "../utils/streamUpload";
import ApiFeatures from "../utils/ApiFeatures";

export const getLoginUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?._id).select("-avatar.public_id");
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
    }).select("-avatar.public_id");

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
  const session = await startSession();

  try {
    session.startTransaction();

    // * Validate incoming password
    const { success, data, error } = deleteProfileSchema.safeParse(req.body);
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
    const passwordValid = await user.isPasswordsTheSame(
      data.password,
      user.password
    );
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

export const uploadAvatar: RequestHandler = async (req, res, next) => {
  try {
    // * Check if file exist
    if (!req.file) {
      next(new AppError("Please upload image", 400));
      return;
    }

    const user = await User.findById(req.user?._id);
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    // * Delete old avatar if exist
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    const avatar = req.file as Express.Multer.File;

    // * Upload new avatar to cloudinary
    const results: any = await streamUpload(avatar.buffer, "Apartly/Avatars");

    // Save to user document
    user.avatar = {
      url: results.secure_url,
      public_id: results.public_id,
    };

    await user.save();

    // * dont send public_id
    user.avatar.public_id = "";

    res.status(200).send({
      success: true,
      message: "Avatar uploaded successfully",
      results: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAvatar: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    await cloudinary.uploader.destroy(user.avatar.public_id);

    user.avatar.url = "";
    user.avatar.public_id = "";
    await user.save();

    const editedUser = _.pick(user, getUserFields());

    res.status(200).send({
      success: true,
      message: "Avatar deleted successfully",
      results: editedUser,
    });
  } catch (error) {
    next(error);
  }
};

// ? ADMIN
export const getAllUsers: RequestHandler = async (req, res, next) => {
  try {
    const features = new ApiFeatures(
      User.find({ _id: { $ne: req.user?._id } }),
      req.query
    ).pagination();

    const users = await features.mongooseQuery.select("-avatar.public_id");

    // * Count total documents after applying filters & search (but before pagination)
    const totalDocuments = await User.countDocuments({
      _id: { $ne: req.user?._id },
      ...features.filtersApplied,
    });

    // * PAGINATION INFO
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      success: true,
      results: users,
      pagination: {
        currentPage: page,
        totalPages,
        currentCountPerPage: users.length,
        totalPerPage: limit,
        totalDocuments: totalDocuments ? totalDocuments - 1 : totalDocuments, // * If docCount is greater than 0, Dont include the admin user making the request
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUserAccount: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  const session = await startSession();

  try {
    session.startTransaction();

    const user = await User.findById(req.params.id).session(session);
    if (!user) {
      next(new AppError("User not found", 404));
      return;
    }

    // * If user is landlord, delete apartments and their images in cloudinary
    if (user.role === "landlord") {
      const apartments = await Apartment.find({ landlord: user._id }).session(
        session
      );

      const imagesEntries = apartments.map((a) => a.images);
      const images = imagesEntries.flat();

      await Promise.allSettled(
        images.map((img) => cloudinary.uploader.destroy(img.public_id))
      );

      await Apartment.deleteMany({ landlord: user._id }, { session });
    }

    // * If User has avatar, delete it in cloudinary
    if (user.avatar.public_id) {
      await cloudinary.uploader.destroy(user.avatar.public_id);
    }

    // * delete user from database
    await user.deleteOne({ session });

    // * commit all operations
    session.commitTransaction();

    res.status(200).send({
      success: true,
      message: "User Account deleted successfully",
    });
  } catch (error) {
    // * abort all operations
    session.abortTransaction();
    next(error);
  } finally {
    // * close the session
    session.endSession();
  }
};
