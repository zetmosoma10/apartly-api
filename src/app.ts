import { env } from "node:process";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import apartmentRoutes from "./routes/apartmentRoutes";
import globalErrorHandler from "./middleware/globalErrorHandler";
import authRouter from "./routes/authRoutes";
import userRouter from "./routes/userRoutes";

const app = express();

const limit = rateLimit({
  windowMs: 15 * 60 * 1000, // * 15 minutes
  max: 100, // * limit each IP to 100 requests per windowMs // 100 requests
  message: "Too many requests from this IP, please try again after an hour",
});

app.set("trust proxy", 1);
app.use(cors());
app.use(express.json());
app.use(limit);
app.use(helmet());
app.use(compression());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/apartments", apartmentRoutes);
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use((req, res) => {
  res.status(400).send({
    success: false,
    message: `Invalid path: ${req.path}`,
  });
});
app.use(globalErrorHandler);

export default app;
