/**
 * @fileoverview Shared helpers for parsing query params, pagination and sorting.
 */

import { config } from '../config/config.js';

/**
 * Parse a positive integer from a query value, with fallback.
 * @param {string|undefined} value
 * @param {number} fallback
 * @returns {number}
 */
export function parsePositiveInt(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Extract pagination from Express query object.
 * @param {import('express').Request['query']} query
 * @returns {{ page: number, limit: number, offset: number }}
 */
export function parsePagination(query) {
  const page = parsePositiveInt(query.page, config.defaultPage);
  let limit = parsePositiveInt(query.limit, config.defaultLimit);
  if (limit > config.maxLimit) limit = config.maxLimit;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
}

/**
 * Allowed sort fields for papers.
 * @type {Set<string>}
 */
const ALLOWED_SORT = new Set(['year', 'subject', 'grade', 'province', 'session']);

/**
 * Parse sort field from query. Defaults to year (descending).
 * @param {import('express').Request['query']} query
 * @returns {{ field: string, order: 'asc'|'desc' }}
 */
export function parseSort(query) {
  const field = String(query.sort || 'year').toLowerCase();
  const order = String(query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  return {
    field: ALLOWED_SORT.has(field) ? field : 'year',
    order,
  };
}

/**
 * Build a filter object from query params (only defined, non-empty values).
 * @param {import('express').Request['query']} query
 * @param {string[]} allowedKeys
 * @returns {Record<string, string|number>}
 */
export function parseFilters(query, allowedKeys) {
  /** @type {Record<string, string|number>} */
  const filters = {};
  for (const key of allowedKeys) {
    const raw = query[key];
    if (raw === undefined || raw === null || raw === '') continue;
    if (key === 'grade' || key === 'year' || key === 'paper') {
      const n = parseInt(String(raw), 10);
      if (Number.isFinite(n)) filters[key] = n;
    } else {
      filters[key] = String(raw).trim();
    }
  }
  return filters;
}

/**
 * Case-insensitive string equality.
 * @param {string|null|undefined} a
 * @param {string|null|undefined} b
 * @returns {boolean}
 */
export function equalsIgnoreCase(a, b) {
  return String(a || '').toLowerCase() === String(b || '').toLowerCase();
}

/**
 * Case-insensitive substring match.
 * @param {string|null|undefined} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export function includesIgnoreCase(haystack, needle) {
  return String(haystack || '')
    .toLowerCase()
    .includes(String(needle).toLowerCase());
}
