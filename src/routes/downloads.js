import { Router } from 'express';
import { download, view } from '../controllers/paperController.js';

const router = Router();

/** GET /api/v1/download/:id?type=pdf|memo */
router.get('/download/:id', download);

/** GET /api/v1/view/:id?type=pdf|memo */
router.get('/view/:id', view);

export default router;
