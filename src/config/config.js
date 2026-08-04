/**
 * @fileoverview Application configuration loaded from environment variables.
 * Single source of truth for ports, paths, pagination defaults, etc.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {Object} AppConfig
 * @property {number} port
 * @property {string} nodeEnv
 * @property {string} papersPath
 * @property {number} defaultPage
 * @property {number} defaultLimit
 * @property {number} maxLimit
 * @property {string[]} corsOrigins
 */

/** @type {AppConfig} */
export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  /** Absolute path to the papers JSON data file */
  papersPath:
    process.env.PAPERS_PATH ||
    path.resolve(__dirname, '../data/papers.json'),

  /** Pagination defaults */
  defaultPage: 1,
  defaultLimit: parseInt(process.env.DEFAULT_LIMIT || '20', 10),
  maxLimit: parseInt(process.env.MAX_LIMIT || '100', 10),

  /** Comma-separated list of allowed CORS origins (empty = reflect request origin) */
  corsOrigins: (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

export default config;
