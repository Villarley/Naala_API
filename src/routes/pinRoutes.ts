import express from 'express';
import { generatePin, verifyPin } from '../controllers/pinController';

const router = express.Router();

router.post("/generate", generatePin as any)
router.post('/verifyPin', verifyPin as any);

export default router;
