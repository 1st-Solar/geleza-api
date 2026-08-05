/**
 * @fileoverview Sorting helpers.
 */

import { SORT_FIELDS } from '../config/constants.js';

/**
 * @param {import('express').Request['query']} query
 * @returns {{ field: string, order: 'asc'|'desc' }}
 */
export function parseSort(query) {
  const field = String(query.sort || 'year').toLowerCase();
  const order =
    String(query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
  return {
    field: SORT_FIELDS.includes(field) ? field : 'year',
    order,
  };
}

/**
 * @param {Array<object>} list
 * @param {{ field: string, order: 'asc'|'desc' }} sort
 * @returns {Array<object>}
 */
export function applySort(list, sort) {
  const { field, order } = sort;
  const dir = order === 'asc' ? 1 : -1;

  return [...list].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'number' && typeof bv === 'number') {
      return (av - bv) * dir;
    }
    return (
      String(av).localeCompare(String(bv), undefined, { sensitivity: 'base' }) *
      dir
    );
  });
}
