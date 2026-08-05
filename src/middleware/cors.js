/**
 * @fileoverview CORS configuration.
 */

import cors from 'cors';
import { config } from '../config/config.js';

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    if (config.corsOrigins.length === 0) {
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
