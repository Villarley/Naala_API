import express from 'express';
import { generatePin } from '../controllers/pinController';
import { verifyPin } from '../controllers/pinController';

const router = express.Router();

router.post('/generate', generatePin as any);
router.post('/verify', verifyPin as any);

export default router;
