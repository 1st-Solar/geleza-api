/**
 * @fileoverview Search controller.
 */

import * as searchService from '../services/searchService.js';
import { parsePagination } from '../utils/pagination.js';
import { validateSearchQuery, validatePaperQuery } from '../middleware/validation.js';

/**
 * GET /api/v1/search?q=...
 * @type {import('express').RequestHandler}
 */
export async function search(req, res, next) {
  try {
    validatePaperQuery(req.query);
    validateSearchQuery(req.query.q);
    const { page, limit, offset } = parsePagination(req.query);

    const result = searchService.search(String(req.query.q), {
      offset,
      limit,
      page,
    });

    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}
