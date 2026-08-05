/**
 * Smoke tests – run with: npm test
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parsePagination } from '../src/utils/pagination.js';
import { parseSort, applySort } from '../src/utils/sorting.js';
import { parseFilters, applyFilters } from '../src/utils/filtering.js';

describe('pagination', () => {
  it('defaults page and limit', () => {
    const p = parsePagination({});
    assert.equal(p.page, 1);
    assert.ok(p.limit > 0);
    assert.equal(p.offset, 0);
  });

  it('computes offset', () => {
    const p = parsePagination({ page: '3', limit: '10' });
    assert.equal(p.page, 3);
    assert.equal(p.limit, 10);
    assert.equal(p.offset, 20);
  });
});

describe('sorting', () => {
  it('defaults to year desc', () => {
    const s = parseSort({});
    assert.equal(s.field, 'year');
    assert.equal(s.order, 'desc');
  });

  it('sorts numeric field', () => {
    const list = applySort(
      [{ year: 2020 }, { year: 2025 }, { year: 2022 }],
      { field: 'year', order: 'desc' }
    );
    assert.deepEqual(
      list.map((x) => x.year),
      [2025, 2022, 2020]
    );
  });
});

describe('filtering', () => {
  it('parses grade and memo', () => {
    const f = parseFilters({ grade: '12', memo: 'true', subject: 'Mathematics' });
    assert.equal(f.grade, 12);
    assert.equal(f.memo, true);
    assert.equal(f.subject, 'Mathematics');
  });

  it('filters by grade and subject', () => {
    const data = [
      { grade: 12, subject: 'Mathematics' },
      { grade: 11, subject: 'Mathematics' },
      { grade: 12, subject: 'Physics' },
    ];
    const result = applyFilters(data, { grade: 12, subject: 'mathematics' });
    assert.equal(result.length, 1);
    assert.equal(result[0].subject, 'Mathematics');
  });
});
