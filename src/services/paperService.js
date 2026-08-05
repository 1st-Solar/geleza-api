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
 * Resolve the stored source URL for a paper (Drive or direct).
 * Clients never receive this URL — only used server-side to proxy the PDF.
 * @param {string} id
 * @param {'pdf'|'memo'} [type='pdf']
 * @returns {{ paper: object, sourceUrl: string, kind: string }}
 */
export function resolveSourceUrl(id, type = 'pdf') {
  const paper = getPaperById(id);
  const sourceUrl = type === 'memo' ? paper.memoPdf : paper.pdf;

  if (!sourceUrl) {
    throw httpError(
      404,
      `No ${type === 'memo' ? 'memo' : 'question paper'} for paper ${id}`,
      ErrorCode.NOT_FOUND
    );
  }

  return {
    paper,
    sourceUrl,
    kind: type === 'memo' ? 'memo' : 'paper',
  };
}

/**
 * Metadata only — links point at this API's proxy endpoints, never Drive.
 * @param {string} id
 * @param {'pdf'|'memo'} [type='pdf']
 * @param {string} [apiBase]
 */
export function getDownloadInfo(id, type = 'pdf', apiBase) {
  resolveSourceUrl(id, type); // throws if missing

  const suffix = type === 'memo' ? '?type=memo' : '';
  /** @type {{ url: string, cached: boolean, type: string, links?: object }} */
  const result = {
    // Client-facing URL is always the API proxy (same host)
    url: apiBase
      ? `${apiBase}/download/${id}${suffix}`
      : `/api/v1/download/${id}${suffix}`,
    cached: false,
    type: type === 'memo' ? 'memo' : 'paper',
  };

  if (apiBase) {
    result.links = {
      self: `${apiBase}/papers/${id}`,
      view: `${apiBase}/view/${id}${suffix}`,
      download: `${apiBase}/download/${id}${suffix}`,
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
