import express from "express";
import cors from "cors"
import apartmentRoutes from "./routes/apartmentRoutes";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

app.use(cors())
app.use(express.json());

app.use("/api/apartments", apartmentRoutes);
app.use(globalErrorHandler);

export default app;
