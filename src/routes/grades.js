import { Router } from 'express';
import { grades } from '../controllers/paperController.js';

const router = Router();
router.get('/', grades);
export default router;
