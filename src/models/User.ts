import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "firstName is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "lastName is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["tenant", "landlord"],
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

const User = model("User", userSchema);

export default User;
