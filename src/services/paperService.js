/**
 * @fileoverview Paper service – thin orchestration layer between controllers
 * and the repository. Keeps business rules out of controllers.
 */

import * as repo from '../repositories/paperRepository.js';
import { httpError } from '../middleware/errors.js';

/**
 * List papers with filters, sort and pagination.
 * @param {object} options
 * @returns {{ data: Array<object>, total: number, page: number, limit: number, totalPages: number }}
 */
export function listPapers(options) {
  const { data, total } = repo.findPapers(options);
  const limit = options.limit || 20;
  const page = options.page || 1;
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

/**
 * Get a single paper by id or throw 404.
 * @param {string} id
 * @returns {object}
 */
export function getPaperById(id) {
  const paper = repo.findById(id);
  if (!paper) {
    throw httpError(404, `Paper not found: ${id}`);
  }
  return paper;
}

/**
 * Search papers.
 * @param {string} q
 * @param {object} options
 * @returns {{ data: Array<object>, total: number, page: number, limit: number, totalPages: number }}
 */
export function searchPapers(q, options) {
  if (!q || !String(q).trim()) {
    throw httpError(400, 'Query parameter "q" is required');
  }
  const { data, total } = repo.search(q, options);
  const limit = options.limit || 20;
  const page = options.page || 1;
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

export function getGrades() {
  return repo.getGrades();
}

export function getSubjects(grade) {
  return repo.getSubjects(grade);
}

export function getYears(grade, subject) {
  return repo.getYears(grade, subject);
}

export function getSessions(grade, subject, year) {
  return repo.getSessions(grade, subject, year);
}

export function getStats() {
  return repo.getStats();
}

export default {
  listPapers,
  getPaperById,
  searchPapers,
  getGrades,
  getSubjects,
  getYears,
  getSessions,
  getStats,
};
