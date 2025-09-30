import { RequestHandler } from "express";
import Apartment from "../models/Apartment";
import cloudinary from "../configs/cloudinary";
import streamifier from "streamifier";
import AppError from "../utils/AppError";

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
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      bedrooms: req.body.bedrooms,
      bathrooms: req.body.bathrooms,
      city: req.body.city,
      address: req.body.address,
      amenities: req.body.amenities.split(","),
      type: req.body.type,
      images: uploadedImages,
    });

    res.status(201).send({
      success: true,
      apartment,
    });
  } catch (error) {
    next(new AppError("Unexpected error", 500));
  }
};

export const getAllApartments: RequestHandler = async (req, res, next) => {
  try {
    const apartments = await Apartment.find();

    res.status(200).send({
      success: true,
      apartments,
    });
  } catch (error) {
    next(new AppError("Unexpected error", 500));
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
      apartment,
    });
  } catch (error) {
    next(new AppError("Unexpected error", 500));
  }
};
