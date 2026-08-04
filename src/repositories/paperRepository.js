/**
 * @fileoverview Paper repository – the ONLY place that touches the data source.
 *
 * Currently loads papers.json into memory once at startup.
 * To migrate to Supabase: replace the implementation of these methods
 * (and the load() function). Controllers and routes stay unchanged.
 */

import { readFile } from 'fs/promises';
import { config } from '../config/config.js';
import {
  equalsIgnoreCase,
  includesIgnoreCase,
} from '../utils/queryHelpers.js';

/** @type {Array<object>|null} In-memory cache */
let papersCache = null;

/**
 * Load papers from the configured JSON file into memory.
 * Called once at application startup.
 * @returns {Promise<void>}
 */
export async function load() {
  const raw = await readFile(config.papersPath, 'utf8');
  const data = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error('papers.json must contain a JSON array');
  }

  papersCache = data;
  console.log(`[paperRepository] Loaded ${papersCache.length} papers into memory`);
}

/**
 * Ensure data is loaded.
 * @returns {Array<object>}
 */
function getAll() {
  if (!papersCache) {
    throw new Error('Paper repository not initialised – call load() first');
  }
  return papersCache;
}

/**
 * Apply filter object to a list of papers.
 * @param {Array<object>} list
 * @param {Record<string, string|number>} filters
 * @returns {Array<object>}
 */
function applyFilters(list, filters) {
  return list.filter((p) => {
    if (filters.grade !== undefined && p.grade !== filters.grade) return false;
    if (filters.year !== undefined && p.year !== filters.year) return false;
    if (filters.paper !== undefined && p.paper !== filters.paper) return false;

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

/**
 * Sort a list of papers.
 * @param {Array<object>} list
 * @param {{ field: string, order: 'asc'|'desc' }} sort
 * @returns {Array<object>}
 */
function applySort(list, sort) {
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
    return String(av).localeCompare(String(bv)) * dir;
  });
}

/**
 * Find papers matching filters, with pagination and sorting.
 * @param {object} options
 * @param {Record<string, string|number>} [options.filters]
 * @param {{ field: string, order: 'asc'|'desc' }} [options.sort]
 * @param {number} [options.offset]
 * @param {number} [options.limit]
 * @returns {{ data: Array<object>, total: number }}
 */
export function findPapers({ filters = {}, sort = { field: 'year', order: 'desc' }, offset = 0, limit = 20 } = {}) {
  let list = getAll();
  list = applyFilters(list, filters);
  list = applySort(list, sort);

  const total = list.length;
  const data = list.slice(offset, offset + limit);
  return { data, total };
}

/**
 * Find a single paper by id.
 * @param {string} id
 * @returns {object|null}
 */
export function findById(id) {
  return getAll().find((p) => p.id === id) || null;
}

/**
 * Full-text-ish search across subject, province, session, assessmentType.
 * @param {string} q
 * @param {object} [options]
 * @param {number} [options.offset]
 * @param {number} [options.limit]
 * @returns {{ data: Array<object>, total: number }}
 */
export function search(q, { offset = 0, limit = 20 } = {}) {
  const needle = String(q || '').trim();
  if (!needle) {
    return { data: [], total: 0 };
  }

  const list = getAll().filter(
    (p) =>
      includesIgnoreCase(p.subject, needle) ||
      includesIgnoreCase(p.province, needle) ||
      includesIgnoreCase(p.session, needle) ||
      includesIgnoreCase(p.assessmentType, needle) ||
      includesIgnoreCase(p.language, needle) ||
      includesIgnoreCase(String(p.year), needle) ||
      includesIgnoreCase(String(p.grade), needle)
  );

  const total = list.length;
  return { data: list.slice(offset, offset + limit), total };
}

/**
 * Distinct sorted grades.
 * @returns {number[]}
 */
export function getGrades() {
  const set = new Set(getAll().map((p) => p.grade).filter((g) => g != null));
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Distinct subjects, optionally filtered by grade.
 * @param {number|undefined} grade
 * @returns {string[]}
 */
export function getSubjects(grade) {
  let list = getAll();
  if (grade !== undefined) {
    list = list.filter((p) => p.grade === grade);
  }
  const set = new Set(list.map((p) => p.subject).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Distinct years for a grade + subject.
 * @param {number|undefined} grade
 * @param {string|undefined} subject
 * @returns {number[]}
 */
export function getYears(grade, subject) {
  let list = getAll();
  if (grade !== undefined) list = list.filter((p) => p.grade === grade);
  if (subject !== undefined) {
    list = list.filter((p) => equalsIgnoreCase(p.subject, subject));
  }
  const set = new Set(list.map((p) => p.year).filter((y) => y != null));
  return Array.from(set).sort((a, b) => b - a); // newest first
}

/**
 * Distinct sessions for grade + subject + year.
 * @param {number|undefined} grade
 * @param {string|undefined} subject
 * @param {number|undefined} year
 * @returns {string[]}
 */
export function getSessions(grade, subject, year) {
  let list = getAll();
  if (grade !== undefined) list = list.filter((p) => p.grade === grade);
  if (subject !== undefined) {
    list = list.filter((p) => equalsIgnoreCase(p.subject, subject));
  }
  if (year !== undefined) list = list.filter((p) => p.year === year);

  const set = new Set(
    list.map((p) => p.session).filter((s) => s != null && s !== '')
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Aggregate stats.
 * @returns {object}
 */
export function getStats() {
  const all = getAll();
  const subjects = new Set();
  const grades = new Set();
  const years = new Set();
  const provinces = new Set();
  const sessions = new Set();

  for (const p of all) {
    if (p.subject) subjects.add(p.subject);
    if (p.grade != null) grades.add(p.grade);
    if (p.year != null) years.add(p.year);
    if (p.province) provinces.add(p.province);
    if (p.session) sessions.add(p.session);
  }

  return {
    totalPapers: all.length,
    subjects: subjects.size,
    grades: Array.from(grades).sort((a, b) => a - b),
    years: Array.from(years).sort((a, b) => b - a),
    provinces: Array.from(provinces).sort((a, b) => a.localeCompare(b)),
    sessions: Array.from(sessions).sort((a, b) => a.localeCompare(b)),
  };
}

export default {
  load,
  findPapers,
  findById,
  search,
  getGrades,
  getSubjects,
  getYears,
  getSessions,
  getStats,
};
