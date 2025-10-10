import { env } from "node:process";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import JwtPayload from "../entities/jwtPayload";
import AppError from "../utils/AppError";
import User from "../models/User";

export const protectRoute: RequestHandler = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      next(new AppError("No token, authentication failed.", 401));
      return;
    }

    let decodedJwt = {} as JwtPayload;
    try {
      decodedJwt = jwt.verify(
        token,
        env.APARTLY_JWT_SECRET as string
      ) as JwtPayload;
    } catch (error) {
      next(error);
      return;
    }

    // * FETCH USER FROM DB
    const user = await User.findById(decodedJwt._id);
    if (!user) {
      next(new AppError("User not found", 401));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoute: RequestHandler = async (
  req,
  res,
  next
) => {
  const user = req.user;

  const selectedRoles = ['landlord','admin']

  if (!selectedRoles.includes(user?.role!)) {
    next(new AppError("Access denied", 403));
    return;
  }

  next();
};
