import { Router } from 'express';
import { subjects } from '../controllers/paperController.js';

const router = Router();
router.get('/', subjects);
export default router;
