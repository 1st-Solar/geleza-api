/**
 * @fileoverview Global rate limiter.
 */

import rateLimit from 'express-rate-limit';
import { config } from '../config/config.js';
import { ErrorCode } from '../config/constants.js';

export const rateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: ErrorCode.RATE_LIMITED,
      message: 'Too many requests, please try again later',
    },
  },
});

export default rateLimiter;
