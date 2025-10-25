import { Types } from "mongoose";
import { UserDocument } from "./UserDocument";

export type ApartmentDocument = {
  _id: Types.ObjectId;
  title: string;
  description: string;
  price: number;
  landlord: Types.ObjectId | UserDocument;
  bedrooms: number;
  bathrooms: number;
  city: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  ratings: Rating[];
  totalRatings: number;
  averageRatings: number;
  amenities: string[];
  images: {
    url: string;
    public_id: string;
  }[];
  status: "available" | "rented" | "maintenance";
  type:
    | "1-bedroom"
    | "2-bedrooms"
    | "3-bedrooms"
    | "studio"
    | "bachelor"
    | "other";
};

type Rating = {
  tenant: Types.ObjectId | UserDocument;
  rating?: number;
  comment?: string;
};
