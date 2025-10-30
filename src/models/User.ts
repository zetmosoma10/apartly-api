import { env } from "node:process";
import { model, Schema } from "mongoose";
import { UserDocument } from "../entities/UserDocument";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
      minlength: [1, "firstName too short"],
      maxlength: [255, "firstName too long"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
      minlength: [1, "lastName too short"],
      maxlength: [255, "lastName too long"],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: [true, "email is required"],
      maxLength: [100, "email too long"],
      validate: {
        validator: (val: string) => validator.isEmail(val),
        message: "invalid email",
      },
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: [4, "password too short"],
      maxlength: [255, "password too long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["tenant", "landlord", "admin"],
      default: "tenant",
    },
    phone: {
      type: String,
      required: [true, "phone is required"],
      trim: true,
    },
    avatar: {
      url: String,
      public_id: String,
    },
  },
  { timestamps: true }
);

// * ENCRYPT THE PASSWORD
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// * GENERATE JWT
type expInType = "1m" | "1d" | "2d";

userSchema.methods.generateJwt = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
    },
    env.APARTLY_JWT_SECRET!,
    {
      expiresIn: env.APARTLY_JWT_EXP as expInType,
    }
  );
};

// * COMPARE PASSWORD
userSchema.methods.isPasswordsTheSame = async function (
  password: string,
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

const User = model<UserDocument>("User", userSchema);

export default User;
