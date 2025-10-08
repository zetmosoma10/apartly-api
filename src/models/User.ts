import { env } from "node:process";
import { model, Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
      minlength: [4, "firstName too short"],
      maxlength: [255, "firstName too long"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
      minlength: [4, "lastName too short"],
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
userSchema.methods.generateJwt = function (): string {
  return jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
    },
    env.APARTLY_JWT_SECRET!,
    {
      expiresIn: "1d",
    }
  );
};

const User = model("User", userSchema);

export default User;
