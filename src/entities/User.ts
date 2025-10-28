import { Types } from "mongoose";

export type User = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: "tenant" | "landlord" | "admin";
  avatar: {
    url: string;
    public_id: string;
  };
};
