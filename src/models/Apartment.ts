import { model, Schema } from "mongoose";

const apartmentSchema = new Schema(
  {
    title: {
      type: String,
      minLength: [1, "title required"],
      maxLength: [255, "title too long"],
      required: true,
    },
    description: {
      type: String,
      minLength: [1, "description required"],
      maxLength: [1020, "description too long"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      default: 0,
    },
    bathrooms: {
      type: Number,
      default: 0,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    amenities: [String],
    images: {
      type: [String],
      required: true,
    },
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
    type: {
      type: String,
      enum: [
        "studio",
        "bachelor",
        "1-bedroom",
        "2-bedroom",
        "3-bedroom",
        "other",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const Apartment = model("Apartment", apartmentSchema);

export default Apartment;
