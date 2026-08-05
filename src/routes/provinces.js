import { Router } from 'express';
import { provinces } from '../controllers/paperController.js';

const router = Router();
router.get('/', provinces);
export default router;
