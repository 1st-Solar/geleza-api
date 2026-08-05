/**
 * @fileoverview Paper repository – sole data-access layer.
 *
 * Current: in-memory papers.json
 * Future:  replace this file with a Supabase implementation.
 *          Keep the same method signatures so services stay unchanged.
 */

import { readFile } from 'fs/promises';
import { config } from '../config/config.js';
import {
  applyFilters,
  equalsIgnoreCase,
  includesIgnoreCase,
} from '../utils/filtering.js';
import { applySort } from '../utils/sorting.js';
import { cacheGet, cacheSet, cacheClear } from '../utils/cache.js';

/** @type {Array<object>|null} */
let cache = null;

/**
 * Load papers into memory. Call once at startup.
 * @returns {Promise<number>} number of papers loaded
 */
export async function load() {
  const raw = await readFile(config.papersPath, 'utf8');
  const data = JSON.parse(raw);
  if (!Array.isArray(data)) {
    throw new Error('papers.json must contain a JSON array');
  }
  cache = data;
  cacheClear();
  console.log(`[paperRepository] Loaded ${cache.length} papers into memory`);
  return cache.length;
}

/** @returns {Array<object>} */
function getAll() {
  if (!cache) {
    throw new Error('Repository not initialised – call load() at startup');
  }
  return cache;
}

/** @returns {number} */
export function count() {
  return getAll().length;
}

/**
 * @param {object} [options]
 * @returns {{ data: Array<object>, total: number }}
 */
export function findPapers({
  filters = {},
  sort = { field: 'year', order: 'desc' },
  offset = 0,
  limit = 20,
} = {}) {
  let list = getAll();
  list = applyFilters(list, filters);
  list = applySort(list, sort);
  return { data: list.slice(offset, offset + limit), total: list.length };
}

/**
 * @param {string} id
 * @returns {object|null}
 */
export function findById(id) {
  return getAll().find((p) => p.id === id) || null;
}

/**
 * @param {string} q
 * @param {{ offset?: number, limit?: number }} [options]
 * @returns {{ data: Array<object>, total: number }}
 */
export function search(q, { offset = 0, limit = 20 } = {}) {
  const needle = String(q || '').trim();
  if (!needle) return { data: [], total: 0 };

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

  return { data: list.slice(offset, offset + limit), total: list.length };
}

/** @returns {number[]} */
export function getGrades() {
  const key = 'facets:grades';
  const hit = cacheGet(key);
  if (hit) return /** @type {number[]} */ (hit);

  const set = new Set(getAll().map((p) => p.grade).filter((g) => g != null));
  const result = Array.from(set).sort((a, b) => a - b);
  cacheSet(key, result);
  return result;
}

/**
 * @param {number} [grade]
 * @returns {string[]}
 */
export function getSubjects(grade) {
  const key = `facets:subjects:${grade ?? 'all'}`;
  const hit = cacheGet(key);
  if (hit) return /** @type {string[]} */ (hit);

  let list = getAll();
  if (grade !== undefined) list = list.filter((p) => p.grade === grade);
  const set = new Set(list.map((p) => p.subject).filter(Boolean));
  const result = Array.from(set).sort((a, b) => a.localeCompare(b));
  cacheSet(key, result);
  return result;
}

/**
 * @param {Record<string, string|number|boolean>} [filters]
 * @returns {number[]}
 */
export function getYears(filters = {}) {
  let list = applyFilters(getAll(), filters);
  const set = new Set(list.map((p) => p.year).filter((y) => y != null));
  return Array.from(set).sort((a, b) => b - a);
}

/**
 * @param {Record<string, string|number|boolean>} [filters]
 * @returns {string[]}
 */
export function getSessions(filters = {}) {
  let list = applyFilters(getAll(), filters);
  const set = new Set(
    list.map((p) => p.session).filter((s) => s != null && s !== '')
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Return only provinces that actually exist for the given filters.
 * @param {Record<string, string|number|boolean>} [filters]
 * @returns {string[]}
 */
export function getProvinces(filters = {}) {
  let list = applyFilters(getAll(), filters);
  const set = new Set(
    list.map((p) => p.province).filter((s) => s != null && s !== '')
  );
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/** @returns {object} */
export function getStats() {
  const key = 'facets:stats';
  const hit = cacheGet(key);
  if (hit) return /** @type {object} */ (hit);

  const all = getAll();
  const subjects = new Set();
  const grades = new Set();
  const years = new Set();
  const provinces = new Set();
  const sessions = new Set();
  const languages = new Set();

  for (const p of all) {
    if (p.subject) subjects.add(p.subject);
    if (p.grade != null) grades.add(p.grade);
    if (p.year != null) years.add(p.year);
    if (p.province) provinces.add(p.province);
    if (p.session) sessions.add(p.session);
    if (p.language) languages.add(p.language);
  }

  const result = {
    totalPapers: all.length,
    subjects: subjects.size,
    grades: Array.from(grades).sort((a, b) => a - b),
    years: Array.from(years).sort((a, b) => b - a),
    sessions: Array.from(sessions).sort((a, b) => a.localeCompare(b)),
    provinces: Array.from(provinces).sort((a, b) => a.localeCompare(b)),
    languages: Array.from(languages).sort((a, b) => a.localeCompare(b)),
  };
  cacheSet(key, result, 120_000);
  return result;
}

export default {
  load,
  count,
  findPapers,
  findById,
  search,
  getGrades,
  getSubjects,
  getYears,
  getSessions,
  getProvinces,
  getStats,
};
