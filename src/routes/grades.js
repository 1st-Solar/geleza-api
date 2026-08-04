/**
 * @fileoverview Grades routes.
 */

import { Router } from 'express';
import { grades } from '../controllers/paperController.js';

const router = Router();

/** GET /grades */
router.get('/', grades);

export default router;
