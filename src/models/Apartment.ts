import { model, Schema, Types } from "mongoose";

const ratingSchema = new Schema(
  {
    tenant: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

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
    landlord: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    ratings: [ratingSchema],
    totalRatings: {
      type: Number,
      default: 0,
    },
    averageRatings: {
      type: Number,
      default: 0,
    },
    amenities: [String],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["available", "rented", "maintenance"],
      default: "available",
    },
    type: {
      type: String,
      enum: [
        "1-bedroom",
        "2-bedrooms",
        "3-bedrooms",
        "studio",
        "bachelor",
        "other",
      ],
      required: true,
    },
  },
  { timestamps: true }
);

apartmentSchema.index({ status: 1 });
apartmentSchema.index({ type: 1 });
apartmentSchema.index({ createdAt: -1 });
apartmentSchema.index({ city: "text", title: "text", description: "text" });

const Apartment = model("Apartment", apartmentSchema);

export default Apartment;
