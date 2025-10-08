import { RequestHandler } from "express";
import Apartment from "../models/Apartment";
import cloudinary from "../configs/cloudinary";
import streamifier from "streamifier";
import AppError from "../utils/AppError";
import { apartmentSchema, updateApartmentSchema } from "./validationSchemas";

const streamUpload = (fileBuffer: Buffer, folder: string) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

export const createApartment: RequestHandler = async (req, res, next) => {
  try {
    const results = apartmentSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.formErrors));
      return;
    }

    // upload images
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
      images: uploadedImages,
    });

    res.status(201).send({
      success: true,
      results: apartment,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllApartments: RequestHandler = async (req, res, next) => {
  try {
    const apartments = await Apartment.find();

    res.status(200).send({
      success: true,
      count: apartments.length,
      results: apartments,
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

export const updateApartment: RequestHandler<{ id: string }> = async (
  req,
  res,
  next
) => {
  try {
    if (req.body.images) {
      next(new AppError("Cannot update images with this route", 400));
      return;
    }

    const results = updateApartmentSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.formErrors));
      return;
    }

    const apartment = await Apartment.findByIdAndUpdate(
      req.params.id,
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
    next(error);
  }
};


export const deleteApartment: RequestHandler<{ id: string }> = async (
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