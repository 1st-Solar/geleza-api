/**
 * @fileoverview Lightweight query validation helpers.
 */

import { httpError } from './errors.js';
import { ErrorCode } from '../config/constants.js';
import { config } from '../config/config.js';

/**
 * Validate common numeric query params; throw 400 on bad input.
 * @param {import('express').Request['query']} query
 */
export function validatePaperQuery(query) {
  const numericKeys = ['grade', 'year', 'page', 'limit', 'paper'];

  for (const key of numericKeys) {
    if (query[key] === undefined || query[key] === '') continue;
    const n = Number(query[key]);
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      throw httpError(
        400,
        `Invalid query parameter "${key}": expected a non-negative integer`,
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  if (query.limit !== undefined && query.limit !== '') {
    const limit = parseInt(String(query.limit), 10);
    if (limit > config.maxLimit) {
      throw httpError(
        400,
        `limit cannot exceed ${config.maxLimit}`,
        ErrorCode.VALIDATION_ERROR
      );
    }
  }

  if (query.memo !== undefined && query.memo !== '') {
    const v = String(query.memo).toLowerCase();
    if (!['true', 'false', '1', '0', 'yes', 'no'].includes(v)) {
      throw httpError(
        400,
        'Invalid query parameter "memo": expected true or false',
        ErrorCode.VALIDATION_ERROR
      );
    }
  }
}

/**
 * Require a non-empty search query.
 * @param {unknown} q
 */
export function validateSearchQuery(q) {
  if (!q || !String(q).trim()) {
    throw httpError(
      400,
      'Query parameter "q" is required',
      ErrorCode.VALIDATION_ERROR
    );
  }
}
