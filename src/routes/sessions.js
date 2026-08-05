import { Router } from 'express';
import { sessions } from '../controllers/paperController.js';

const router = Router();
router.get('/', sessions);
export default router;
