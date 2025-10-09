import { env } from "node:process";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import JwtPayload from "../entities/jwtPayload";
import AppError from "../utils/AppError";

const protectRoute: RequestHandler = async (req, res, next) => {
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

    // * CHECK IF PASSWORD HAS NOT BEEN CHANGED AFTER TOKEN BEEN ISSUED

    req.userId = decodedJwt._id;
    next();
  } catch (error) {
    next(error);
  }
};

export default protectRoute;
