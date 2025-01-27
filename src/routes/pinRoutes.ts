import { Router, Request, Response } from 'express';
import { generatePin, verifyPin, generateDocx } from '../controllers/pinController';

const router = Router();

router.post("/generate", generatePin as any)
router.post('/verifyPin', verifyPin as any);

router.post('/generateDocx', generateDocx);


export default router;
