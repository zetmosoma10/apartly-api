import { RequestHandler } from "express";
import AppError from "../utils/AppError";
import User from "../models/User";
import { userSchema } from "../validations/userSchemas";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const results = userSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.format()));

      return;
    }

    const userInDb = await User.findOne({ email: results.data?.email });
    if (userInDb) {
      next(new AppError("User already registered.", 400));

      return;
    }

    const user = await User.create(results.data);

    const token = user.generateJwt();

    res.status(201).send({
      success: true,
      results: user,
      token,
    });
  } catch (error) {
    next(error);
  }
};
