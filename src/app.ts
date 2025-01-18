import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pinRoutes from './routes/pinRoutes';

dotenv.config();
connectDB();

const app = express();

app.use(express.json());

app.use('/api/pins', pinRoutes);

export default app;
