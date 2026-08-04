/**
 * @fileoverview HTTP request logger using morgan.
 */

import morgan from 'morgan';
import { config } from '../config/config.js';

/**
 * Morgan middleware – concise in production, more verbose in development.
 */
export const requestLogger =
  config.nodeEnv === 'production'
    ? morgan('combined')
    : morgan('dev');

export default requestLogger;
