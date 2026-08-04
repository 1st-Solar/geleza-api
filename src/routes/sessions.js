/**
 * @fileoverview Sessions routes.
 */

import { Router } from 'express';
import { sessions } from '../controllers/paperController.js';

const router = Router();

/** GET /sessions?grade=12&subject=Mathematics&year=2025 */
router.get('/', sessions);

export default router;
