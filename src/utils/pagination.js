/**
 * @fileoverview Pagination helpers.
 */

import { config } from '../config/config.js';

/**
 * @param {unknown} value
 * @param {number} fallback
 * @returns {number}
 */
export function parsePositiveInt(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * @param {import('express').Request['query']} query
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query) {
  const page = parsePositiveInt(query.page, config.defaultPage);
  let limit = parsePositiveInt(query.limit, config.defaultLimit);
  if (limit > config.maxLimit) limit = config.maxLimit;
  return { page, limit, offset: (page - 1) * limit };
}

/**
 * Build standard paginated envelope.
 * @param {Array} data
 * @param {number} total
 * @param {number} page
 * @param {number} limit
 */
export function paginatedMeta(total, page, limit) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
