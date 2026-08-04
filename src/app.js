/**
 * @fileoverview Express application setup.
 * Middleware, routes and error handlers are wired here.
 * Does not start the HTTP server (that is server.js).
 */

import express from 'express';
import compression from 'compression';
import { requestLogger } from './middleware/logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';

import gradesRouter from './routes/grades.js';
import subjectsRouter from './routes/subjects.js';
import yearsRouter from './routes/years.js';
import sessionsRouter from './routes/sessions.js';
import papersRouter, { search, stats } from './routes/papers.js';

const app = express();

// ── Global middleware ──────────────────────────────────────────────
app.use(compression());
app.use(corsMiddleware);
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

// ── Health check ───────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ── API routes ─────────────────────────────────────────────────────
app.use('/grades', gradesRouter);
app.use('/subjects', subjectsRouter);
app.use('/years', yearsRouter);
app.use('/sessions', sessionsRouter);
app.use('/papers', papersRouter);

// Extra endpoints mounted at root for convenience
app.get('/search', search);
app.get('/stats', stats);

// ── 404 + error handlers (must be last) ────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
