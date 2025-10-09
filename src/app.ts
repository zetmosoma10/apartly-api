import { env } from "node:process";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import apartmentRoutes from "./routes/apartmentRoutes";
import globalErrorHandler from "./middleware/globalErrorHandler";
import userRouter from "./routes/userRoutes";

const app = express();
app.use(cors());
app.use(express.json());
if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/apartments", apartmentRoutes);
app.use("/api/auth", userRouter);
app.use(globalErrorHandler);

export default app;
