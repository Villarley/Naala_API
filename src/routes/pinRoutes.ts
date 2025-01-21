import express from 'express';
import { generatePin, verifyPin } from '../controllers/pinController';

const router = express.Router();


router.post('/verifyPin', verifyPin as any);

export default router;
