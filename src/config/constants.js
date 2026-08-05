/**
 * @fileoverview Application-wide constants.
 */

export const APP_NAME = 'Geleza API';
export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

/** Allowed sort fields for paper listings */
export const SORT_FIELDS = Object.freeze([
  'year',
  'subject',
  'grade',
  'province',
  'session',
  'assessmentType',
  'language',
  'paper',
]);

/** Filter keys accepted on /papers */
export const PAPER_FILTER_KEYS = Object.freeze([
  'grade',
  'subject',
  'year',
  'session',
  'province',
  'assessmentType',
  'paper',
  'language',
  'memo',
]);

/** Error codes used in API responses */
export const ErrorCode = Object.freeze({
  BAD_REQUEST: 'BAD_REQUEST',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL: 'INTERNAL_ERROR',
});
