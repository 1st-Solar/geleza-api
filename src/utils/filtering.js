/**
 * @fileoverview Chainable filter helpers.
 */

import { PAPER_FILTER_KEYS } from '../config/constants.js';

/**
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function equalsIgnoreCase(a, b) {
  return String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();
}

/**
 * @param {unknown} haystack
 * @param {string} needle
 * @returns {boolean}
 */
export function includesIgnoreCase(haystack, needle) {
  return String(haystack ?? '')
    .toLowerCase()
    .includes(String(needle).toLowerCase());
}

/**
 * Build filters from query params.
 * @param {import('express').Request['query']} query
 * @param {readonly string[]} [allowedKeys]
 * @returns {Record<string, string|number|boolean>}
 */
export function parseFilters(query, allowedKeys = PAPER_FILTER_KEYS) {
  /** @type {Record<string, string|number|boolean>} */
  const filters = {};

  for (const key of allowedKeys) {
    const raw = query[key];
    if (raw === undefined || raw === null || raw === '') continue;

    if (key === 'grade' || key === 'year' || key === 'paper') {
      const n = parseInt(String(raw), 10);
      if (Number.isFinite(n)) filters[key] = n;
    } else if (key === 'memo') {
      const v = String(raw).toLowerCase();
      filters.memo = v === 'true' || v === '1' || v === 'yes';
    } else {
      filters[key] = String(raw).trim();
    }
  }

  return filters;
}

/**
 * AND-filter a list of papers.
 * @param {Array<object>} list
 * @param {Record<string, string|number|boolean>} filters
 * @returns {Array<object>}
 */
export function applyFilters(list, filters) {
  if (!filters || Object.keys(filters).length === 0) return list;

  return list.filter((p) => {
    if (filters.grade !== undefined && p.grade !== filters.grade) return false;
    if (filters.year !== undefined && p.year !== filters.year) return false;
    if (filters.paper !== undefined && p.paper !== filters.paper) return false;
    if (filters.memo !== undefined && Boolean(p.memo) !== filters.memo) {
      return false;
    }
    if (
      filters.subject !== undefined &&
      !equalsIgnoreCase(p.subject, filters.subject)
    ) {
      return false;
    }
    if (
      filters.session !== undefined &&
      !equalsIgnoreCase(p.session, filters.session)
    ) {
      return false;
    }
    if (
      filters.province !== undefined &&
      !equalsIgnoreCase(p.province, filters.province)
    ) {
      return false;
    }
    if (
      filters.assessmentType !== undefined &&
      !equalsIgnoreCase(p.assessmentType, filters.assessmentType)
    ) {
      return false;
    }
    if (
      filters.language !== undefined &&
      !equalsIgnoreCase(p.language, filters.language)
    ) {
      return false;
    }
    return true;
  });
}
