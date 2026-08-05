/**
 * Health endpoint smoke tests (unit-level helpers + shape checks).
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination } from '../src/utils/pagination.js';
import { ErrorCode } from '../src/config/constants.js';
import { API_PREFIX } from '../src/config/constants.js';

describe('constants', () => {
  it('API prefix is versioned', () => {
    assert.equal(API_PREFIX, '/api/v1');
  });

  it('error codes are defined', () => {
    assert.ok(ErrorCode.NOT_FOUND);
    assert.ok(ErrorCode.VALIDATION_ERROR);
  });
});

describe('pagination', () => {
  it('defaults correctly', () => {
    const p = parsePagination({});
    assert.equal(p.page, 1);
    assert.ok(p.limit >= 1);
    assert.equal(p.offset, 0);
  });
});
