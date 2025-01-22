import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pinRoutes from './routes/pinRoutes';
import cors from 'cors';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const corsOptions = {
    origin: "https://www.urbania-custom.com", // Permitir solo este dominio
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Permite cookies si es necesario
  };

app.use(cors(corsOptions));
app.use('/api/pins', pinRoutes);

export default app;
