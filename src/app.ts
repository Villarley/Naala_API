import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import pinRoutes from "./routes/pinRoutes";
import docxRoutes from "./routes/docxRoutes";
import cors from "cors";

dotenv.config();
connectDB();

const app = express();
// Use express
app.use(express.json());

app.options('*', cors()); // Permite solicitudes preflight para todas las rutas

app.use("/api/pins", pinRoutes);
app.use("/api/docx", docxRoutes);

export default app;
