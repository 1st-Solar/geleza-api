/**
 * @fileoverview Express application setup.
 */

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { requestLogger } from './middleware/logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errors.js';
import { createApiRouter } from './config/routes.js';
import { API_PREFIX } from './config/constants.js';

const app = express();

// Required on Railway / reverse proxies so req.protocol and req.ip are correct
app.set('trust proxy', 1);

// Security & performance
app.use(helmet());
app.use(compression());
app.use(corsMiddleware);
app.use(rateLimiter);
app.use(requestLogger);
app.use(express.json({ limit: '1mb' }));

// Versioned API
app.use(API_PREFIX, createApiRouter());

// Root redirect for convenience
app.get('/', (_req, res) => {
  res.redirect(302, `${API_PREFIX}/health`);
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
