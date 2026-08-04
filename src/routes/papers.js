/**
 * @fileoverview Papers, search and stats routes.
 */

import { Router } from 'express';
import {
  listPapers,
  getPaper,
  search,
  stats,
} from '../controllers/paperController.js';

const router = Router();

/** GET /papers – filtered, paginated list */
router.get('/', listPapers);

/** GET /papers/:id */
router.get('/:id', getPaper);

export { search, stats };
export default router;
