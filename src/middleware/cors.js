/**
 * @fileoverview CORS middleware configuration.
 */

import cors from 'cors';
import { config } from '../config/config.js';

/**
 * CORS options. If CORS_ORIGINS is set, only those origins are allowed.
 * Otherwise all origins are reflected (suitable for mobile / Capacitor).
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header)
    if (!origin) {
      callback(null, true);
      return;
    }

    if (config.corsOrigins.length === 0) {
      // Reflect any origin
      callback(null, true);
      return;
    }

    if (config.corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 86400,
};

export const corsMiddleware = cors(corsOptions);

export default corsMiddleware;
