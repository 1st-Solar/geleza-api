/**
 * Filtering and sorting unit tests.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseFilters, applyFilters } from '../src/utils/filtering.js';
import { parseSort, applySort } from '../src/utils/sorting.js';

const sample = [
  {
    grade: 12,
    subject: 'Mathematics',
    year: 2025,
    province: 'National',
    session: 'November',
    memo: true,
  },
  {
    grade: 12,
    subject: 'Mathematics',
    year: 2024,
    province: 'KwaZulu-Natal',
    session: 'June',
    memo: false,
  },
  {
    grade: 11,
    subject: 'Physical Sciences',
    year: 2025,
    province: 'Gauteng',
    session: 'March',
    memo: true,
  },
];

describe('parseFilters', () => {
  it('coerces grade and memo', () => {
    const f = parseFilters({ grade: '12', memo: 'true', subject: 'Mathematics' });
    assert.equal(f.grade, 12);
    assert.equal(f.memo, true);
    assert.equal(f.subject, 'Mathematics');
  });
});

describe('applyFilters', () => {
  it('filters by grade and subject', () => {
    const result = applyFilters(sample, { grade: 12, subject: 'mathematics' });
    assert.equal(result.length, 2);
  });

  it('filters by memo', () => {
    const result = applyFilters(sample, { memo: true });
    assert.equal(result.length, 2);
  });
});

describe('sorting', () => {
  it('sorts by year desc', () => {
    const sorted = applySort(sample, { field: 'year', order: 'desc' });
    assert.equal(sorted[0].year, 2025);
  });

  it('parseSort defaults', () => {
    const s = parseSort({});
    assert.equal(s.field, 'year');
    assert.equal(s.order, 'desc');
  });
});
