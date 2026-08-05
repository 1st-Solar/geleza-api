import { Router } from 'express';
import { listPapers, getPaper } from '../controllers/paperController.js';

const router = Router();
router.get('/', listPapers);
router.get('/:id', getPaper);
export default router;
