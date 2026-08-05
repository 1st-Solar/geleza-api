/**
 * @fileoverview Health controller.
 */

import { config } from '../config/config.js';
import { getCount } from '../services/paperService.js';

/**
 * GET /api/v1/health
 * @type {import('express').RequestHandler}
 */
export function health(_req, res) {
  const uptimeSeconds = Math.floor((Date.now() - config.startedAt) / 1000);

  res.json({
    success: true,
    data: {
      status: 'ok',
      version: config.appVersion,
      papers: getCount(),
      environment: config.nodeEnv,
      uptime: uptimeSeconds,
    },
  });
}
