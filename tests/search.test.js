/**
 * Search helper tests.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { includesIgnoreCase } from '../src/utils/filtering.js';
import { paginatedMeta } from '../src/utils/pagination.js';

describe('includesIgnoreCase', () => {
  it('matches substrings case-insensitively', () => {
    assert.equal(includesIgnoreCase('Mathematics', 'math'), true);
    assert.equal(includesIgnoreCase('KwaZulu-Natal', 'natal'), true);
    assert.equal(includesIgnoreCase('English', 'afrikaans'), false);
  });
});

describe('paginatedMeta', () => {
  it('computes totalPages', () => {
    const meta = paginatedMeta(100, 2, 20);
    assert.equal(meta.total, 100);
    assert.equal(meta.page, 2);
    assert.equal(meta.totalPages, 5);
  });
});
