/**
 * @fileoverview Central route registration for /api/v1.
 */

import { Router } from 'express';
import healthRouter from '../routes/health.js';
import gradesRouter from '../routes/grades.js';
import subjectsRouter from '../routes/subjects.js';
import yearsRouter from '../routes/years.js';
import sessionsRouter from '../routes/sessions.js';
import provincesRouter from '../routes/provinces.js';
import papersRouter from '../routes/papers.js';
import searchRouter from '../routes/search.js';
import statsRouter from '../routes/stats.js';
import downloadsRouter from '../routes/downloads.js';

/**
 * Build the versioned API router.
 * @returns {import('express').Router}
 */
export function createApiRouter() {
  const api = Router();

  api.use('/health', healthRouter);
  api.use('/grades', gradesRouter);
  api.use('/subjects', subjectsRouter);
  api.use('/years', yearsRouter);
  api.use('/sessions', sessionsRouter);
  api.use('/provinces', provincesRouter);
  api.use('/papers', papersRouter);
  api.use('/search', searchRouter);
  api.use('/stats', statsRouter);

  // download + view live at /api/v1/download/:id and /api/v1/view/:id
  api.use('/', downloadsRouter);

  return api;
}

export default createApiRouter;
