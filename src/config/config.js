/**
 * @fileoverview Environment-driven configuration.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} AppConfig
 */

/** @type {AppConfig} */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  appVersion: process.env.APP_VERSION || '1.0.0',

  papersPath:
    process.env.PAPERS_PATH ||
    path.resolve(__dirname, '../data/papers.json'),

  defaultPage: 1,
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT || '20', 10),
  maxLimit: parseInt(process.env.MAX_LIMIT || '100', 10),

  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '120', 10),
  },

  /** Process start time for uptime calculations */
  startedAt: Date.now(),
};

export default config;
