import express from "express";
import apartmentRoutes from "./routes/apartmentRoutes";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

app.use(express.json());

app.use("/api/apartments", apartmentRoutes);
app.use(globalErrorHandler);

export default app;
