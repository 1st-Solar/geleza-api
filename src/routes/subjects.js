/**
 * @fileoverview Subjects routes.
 */

import { Router } from 'express';
import { subjects } from '../controllers/paperController.js';

const router = Router();

/** GET /subjects?grade=12 */
router.get('/', subjects);

export default router;
