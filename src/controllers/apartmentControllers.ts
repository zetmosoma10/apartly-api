import { RequestHandler } from "express";
import Apartment from "../models/Apartment";
import cloudinary from "../configs/cloudinary";
import streamifier from "streamifier";

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

export const createApartment: RequestHandler = async (req, res) => {
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
    console.log(error);
    res.status(500).send(error);
  }
};
