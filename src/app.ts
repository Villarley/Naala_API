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

app.use(
  cors({
    origin: [
      "https://urbania-custom.com",
      "https://www.urbania-custom.com",
      "https://naala.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use("/", (req, res) => {
  res.json({ msg: "saludos" });
});
app.use("/api/pins", pinRoutes);
app.use("/api/docx", docxRoutes);

export default app;
