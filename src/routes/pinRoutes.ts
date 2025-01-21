import express from 'express';
import { generatePin, verifyPin } from '../controllers/pinController';

const router = express.Router();

router.post('/generate', generatePin);
router.post('/verify', verifyPin);

export default router;
