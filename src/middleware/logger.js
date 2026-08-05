/**
 * @fileoverview Request logging via morgan.
 */

import morgan from 'morgan';
import { config } from '../config/config.js';

export const requestLogger =
  config.nodeEnv === 'production' ? morgan('combined') : morgan('dev');

export default requestLogger;
