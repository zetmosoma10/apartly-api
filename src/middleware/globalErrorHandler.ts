import { ErrorRequestHandler, Response } from "express";
import { env } from "node:process";
import AppError from "../utils/AppError";

const developmentError = (error: any, res: Response) => {
  if (error instanceof AppError) {
    res.status(error.status).send({
      success: false,
      message: error.message,
      results: error.errorObj,
      error,
    });
  } else {
    res.status(error.status).send({
      success: false,
      message: error.message,
      error,
    });
  }
};

const productionError = (error: any, res: Response) => {
  if (error instanceof AppError) {
    res.status(error.status).send({
      success: false,
      message: error.message,
      results: error.errorObj,
    });
  } else {
    res.status(error.status || 500).send({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
};

// ! MONGOOSE ERRORS
const handleDuplicateKey = (err: any) => {
  const duplicateField = Object.keys(err.keyValue)[0];
  const msg = `${duplicateField} already exists`;
  return new AppError(msg, 400);
};

const handleValidationError = (err: any) => {
  const errorMessages = Object.values(err.errors).map(
    (item: any) => item.message
  );
  const msg = `Invalid input data: ${errorMessages.join(". ")}`;
  return new AppError(msg, 400);
};

const handleCastError = (err: any) => {
  const msg = `Invalid value for ${err.path}:${err.value}`;
  return new AppError(msg, 400);
};

// ! JSONWEBTOKEN ERRORS
const handleJsonWebTokenError = (err: any) => {
  return new AppError("Invalid jsonwebtoken", 401);
};

const handleTokenExpireError = (err: any) => {
  return new AppError("Session expired. Please login again.", 401);
};

// ? MIDDLEWARE
const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
  // ****
  error.status = error.status || 500;

  if (env.NODE_ENV === "development") {
    developmentError(error, res);
  } else if (env.NODE_ENV === "production") {
    if (error.name === "CastError") error = handleCastError(error);
    if (error.name === "ValidationError") error = handleValidationError(error);
    if (error.code === 11000) error = handleDuplicateKey(error);
    if (error.name === "JsonWebTokenError")
      error = handleJsonWebTokenError(error);
    if (error.name === "TokenExpiredError")
      error = handleTokenExpireError(error);

    productionError(error, res);
  }
};

export default globalErrorHandler;
