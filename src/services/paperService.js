/**
 * @fileoverview Paper domain service.
 */

import * as repo from '../repositories/paperRepository.js';
import { httpError } from '../middleware/errors.js';
import { ErrorCode } from '../config/constants.js';
import { paginatedMeta } from '../utils/pagination.js';

/**
 * @param {object} options
 * @returns {{ data: Array, meta: object }}
 */
export function listPapers(options) {
  const { data, total } = repo.findPapers(options);
  return {
    data,
    meta: paginatedMeta(total, options.page || 1, options.limit || 20),
  };
}

/**
 * @param {string} id
 * @returns {object}
 */
export function getPaperById(id) {
  const paper = repo.findById(id);
  if (!paper) {
    throw httpError(404, `Paper not found: ${id}`, ErrorCode.NOT_FOUND);
  }
  return paper;
}

/**
 * Download metadata – abstracts storage backend from the client.
 * Optional apiBase is used to attach portable self-links (never hardcode a domain).
 * @param {string} id
 * @param {'pdf'|'memo'} [type='pdf']
 * @param {string} [apiBase] - e.g. "https://host/api/v1" from the request
 * @returns {{ url: string, cached: boolean, type: string, links?: object }}
 */
export function getDownloadInfo(id, type = 'pdf', apiBase) {
  const paper = getPaperById(id);
  const url = type === 'memo' ? paper.memoPdf : paper.pdf;

  if (!url) {
    throw httpError(
      404,
      `No ${type === 'memo' ? 'memo' : 'question paper'} URL for paper ${id}`,
      ErrorCode.NOT_FOUND
    );
  }

  /** @type {{ url: string, cached: boolean, type: string, links?: object }} */
  const result = {
    url,
    cached: false,
    type: type === 'memo' ? 'memo' : 'paper',
  };

  if (apiBase) {
    result.links = {
      self: `${apiBase}/papers/${id}`,
      view: `${apiBase}/view/${id}${type === 'memo' ? '?type=memo' : ''}`,
      download: `${apiBase}/download/${id}${type === 'memo' ? '?type=memo' : ''}`,
    };
  }

  return result;
}

export function getGrades() {
  return repo.getGrades();
}

export function getSubjects(grade) {
  return repo.getSubjects(grade);
}

export function getYears(filters) {
  return repo.getYears(filters);
}

export function getSessions(filters) {
  return repo.getSessions(filters);
}

export function getProvinces(filters) {
  return repo.getProvinces(filters);
}

export function getCount() {
  return repo.count();
}

export default {
  listPapers,
  getPaperById,
  getDownloadInfo,
  getGrades,
  getSubjects,
  getYears,
  getSessions,
  getProvinces,
  getCount,
};
