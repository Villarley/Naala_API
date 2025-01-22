import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db';
import pinRoutes from './routes/pinRoutes';
import cors from 'cors';

dotenv.config();
connectDB();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
};


const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use("/",
    (req, res)=>{
        res.json({msg:"saludos"})
    }
)
app.use('/api/pins', pinRoutes);

export default app;
