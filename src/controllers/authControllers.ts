import { Resend } from "resend";
import { RequestHandler } from "express";
import { env } from "node:process";
import {
  forgotPasswordSchema,
  loginSchema,
  userSchema,
} from "../validations/userSchemas";
import AppError from "../utils/AppError";
import User from "../models/User";
import getUserFields from "../utils/getUserFields";
import _ from "lodash";
import WelcomeEmailTemplate from "../emails/welcomeEmail";
import resetPasswordEmailTemplate from "../emails/resetPasswordEmail";

const resend = new Resend(env.RESEND_API_KEY!);

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

    const editedUser = _.pick(user, getUserFields());

    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM!,
      to: editedUser.email!,
      subject: "Welcome to Apartly!",
      html: WelcomeEmailTemplate({
        firstName: editedUser.firstName,
        email: editedUser.email,
      }),
    });

    if (error) {
      console.error("Failed to send welcome email:", error);
    }

    res.status(201).send({
      success: true,
      token,
      results: editedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const results = loginSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("Invalid input(s)", 400, results.error.format()));

      return;
    }

    const user = await User.findOne({ email: results.data.email }).select(
      "+password -avatar.public_id",
    );
    if (!user) {
      next(new AppError("Invalid email or password", 400));

      return;
    }

    const isPasswordsTheSame = await user.isPasswordsTheSame(
      results.data.password,
      user.password,
    );
    if (!isPasswordsTheSame) {
      next(new AppError("Invalid email or password", 400));

      return;
    }

    const token = user.generateJwt();

    const editedUser = _.pick(user, getUserFields());

    res.status(200).send({
      success: true,
      token,
      results: editedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword: RequestHandler = async (req, res, next) => {
  try {
    const results = forgotPasswordSchema.safeParse(req.body);
    if (!results.success) {
      next(new AppError("Invalid email", 400, results.error.format()));
      return;
    }

    const user = await User.findOne({ email: results.data.email });
    if (!user) {
      next(new AppError("Invalid email", 400));
      return;
    }

    const token = user.generateResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_URL}/reset-password?token=${token}&id=${user._id}`;

    // * SEND EMAIL
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM!,
      to: user.email!,
      subject: "Password reset request",
      html: resetPasswordEmailTemplate(user, url),
    });

    if (error) {
      console.error("Failed to send reset password email:", error);
    }

    res.status(200).send({
      success: true,
      message: "We've sent you reset link on your email.",
    });
  } catch (error) {
    next(error);
  }
};
