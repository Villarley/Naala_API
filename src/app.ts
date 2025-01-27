import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pinRoutes from './routes/pinRoutes';
import docxRoutes from './routes/docxRoutes';
import cors from 'cors';

dotenv.config();
connectDB();
/*
                                           /generateDocx
https://naala-api-steel.vercel.app/api/pins/generateDocx
https://naala-api-steel.vercel.app/api/pins/verifyPin
*/


const app = express();
// Use express
app.use(express.json());

app.use(cors({
    origin: ["https://urbania-custom.com/", "https://naala.vercel.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }));

app.use('/api/pins', pinRoutes);
app.use('/api/docx', docxRoutes);

export default app;
