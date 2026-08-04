/**
 * @fileoverview Years routes.
 */

import { Router } from 'express';
import { years } from '../controllers/paperController.js';

const router = Router();

/** GET /years?grade=12&subject=Mathematics */
router.get('/', years);

export default router;
