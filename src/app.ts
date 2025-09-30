import express from "express";
import apartmentRoutes from "./routes/apartmentRoutes";

const app = express();

app.use(express.json());

app.use("/api/apartments", apartmentRoutes);

export default app;
