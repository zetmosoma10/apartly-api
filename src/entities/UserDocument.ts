import { Types } from "mongoose";

export type UserDocument = {
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
  generateJwt: () => string;
  generateResetPasswordToken: () => string;
  passwordResetTokenExpire: Date;
  isPasswordsTheSame: (
    password: string,
    hashedPassword: string,
  ) => Promise<boolean>;
};
