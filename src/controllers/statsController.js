/**
 * @fileoverview Stats controller.
 */

import * as searchService from '../services/searchService.js';

/**
 * GET /api/v1/stats
 * @type {import('express').RequestHandler}
 */
export async function stats(req, res, next) {
  try {
    res.json({ success: true, data: searchService.getStats() });
  } catch (err) {
    next(err);
  }
}
