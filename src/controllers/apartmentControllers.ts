import { RequestHandler } from "express";
import {
  apartmentSchema,
  rateApartmentSchema,
  updateApartmentSchema,
} from "../validations/apartmentSchemas";
import Apartment from "../models/Apartment";
import cloudinary from "../configs/cloudinary";
import AppError from "../utils/AppError";
import ApiFeatures from "../utils/ApiFeatures";
import streamUpload from "../utils/streamUpload";

export const createApartment: RequestHandler = async (req, res, next) => {
  try {
    const coordinates =
      req.body.coordinates && JSON.parse(req.body.coordinates);

    const results = apartmentSchema.safeParse({ ...req.body, coordinates });
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.formErrors));
      return;
    }

    // * upload images
    const uploadedImages = [];
    for (const file of req.files as Express.Multer.File[]) {
      const result: any = await streamUpload(file.buffer, "Apartly/Apartments");
      uploadedImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const apartment = await Apartment.create({
      ...results.data,
      landlord: req.user?._id,
      images: uploadedImages,
    });

    res.status(201).send({
      success: true,
      results: apartment,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getAllApartments: RequestHandler = async (req, res, next) => {
  try {
    const features = new ApiFeatures(Apartment.find(), req.query)
      .filter()
      .search()
      .sort()
      .pagination();

    const apartments = await features.mongooseQuery;

    // * Count total documents after applying filters & search (but before pagination)
    const totalDocuments = await Apartment.countDocuments(
      features.filtersApplied
    );

    // * PAGINATION INFO
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      success: true,
      results: apartments,
      pagination: {
        currentPage: page,
        totalPages,
        currentCountPerPage: apartments.length,
        totalPerPage: limit,
        totalDocuments,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUserApartments: RequestHandler = async (req, res, next) => {
  try {
    const features = new ApiFeatures(
      Apartment.find({ landlord: req.user?._id }),
      req.query
    )
      .filter()
      .sort()
      .pagination();

    const apartments = await features.mongooseQuery;

    // * Count total documents after applying filters & search (but before pagination)
    const totalDocuments = await Apartment.countDocuments({
      landlord: req.user?._id,
      ...features.filtersApplied,
    });

    // * PAGINATION INFO
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const totalPages = Math.ceil(totalDocuments / limit);

    res.status(200).send({
      success: true,
      results: apartments,
      pagination: {
        currentPage: page,
        totalPages,
        currentCountPerPage: apartments.length,
        totalPerPage: limit,
        totalDocuments,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getApartment: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      next(new AppError("Apartment not found", 404));
      return;
    }

    res.status(200).send({
      success: true,
      results: apartment,
    });
  } catch (error) {
    next(error);
  }
};

export const getFeatureApartments: RequestHandler = async (req, res, next) => {
  try {
    const apartments = await Apartment.find().sort("-createdAt").limit(4);

    res.status(200).send({
      success: true,
      count: apartments.length,
      results: apartments,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApartment: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  try {
    if (req.body?.images) {
      next(new AppError("Cannot update images with this route", 400));
      return;
    }

    const coordinates =
      req.body?.coordinates && JSON.parse(req.body.coordinates);

    const results = updateApartmentSchema.safeParse({
      ...req.body,
      coordinates,
    });
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.formErrors));
      return;
    }

    const apartment = await Apartment.findOneAndUpdate(
      { _id: req.params.id, landlord: req.user?._id },
      results.data,
      { new: true, runValidators: true }
    );

    if (!apartment) {
      next(new AppError("Apartment not found", 404));
      return;
    }

    res.status(200).send({
      success: true,
      results: apartment,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const deleteApartment: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  try {
    const apartment = await Apartment.findOne({
      _id: req.params.id,
      landlord: req.user?._id,
    });
    if (!apartment) {
      next(new AppError("Apartment not found", 404));
      return;
    }

    const images: { url: string; public_id: string }[] = apartment.images;
    await Promise.allSettled(
      images.map((img) => cloudinary.uploader.destroy(img.public_id))
    );

    await apartment.deleteOne();

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const rateApartment: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  try {
    const apartment = await Apartment.findById(req.params.id);
    if (!apartment) {
      next(new AppError("Apartment not found", 404));
      return;
    }

    // * Check if landlord is not rating their own apartment
    if (req.user?._id === apartment.landlord) {
      next(new AppError("Cannot rate your own apartment", 400));
      return;
    }

    const results = rateApartmentSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("invalid input(s)", 400, results.error.formErrors));
      return;
    }

    // * Check if user already rated
    const existingRating = apartment.ratings.find(
      (r) => r.tenant.toString() === req.user?._id.toString()
    );

    if (existingRating) {
      // * Update rating
      existingRating.rating = results.data.rating;
      existingRating.comment = results.data.comment;
    } else {
      // * Create new rating
      apartment.ratings.push({ tenant: req.user?._id, ...results.data });
    }

    // * Calculate average & total ratings
    const totalRatings = apartment.ratings.length;
    const averageRating =
      apartment.ratings.reduce((acc, r) => acc + r.rating, 0) / totalRatings;

    // * Update document with new ratings
    apartment.totalRatings = totalRatings;
    apartment.averageRatings = Number(averageRating.toFixed(1));

    await apartment.save();

    res.status(200).send({
      success: true,
      message: existingRating
        ? "Rating updated successfully"
        : "Rating added successfully",
      results: apartment,
    });
  } catch (error) {
    next(error);
  }
};
