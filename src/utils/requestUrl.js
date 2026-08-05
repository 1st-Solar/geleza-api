/**
 * @fileoverview Build absolute URLs from the incoming request.
 * Keeps the API portable across localhost, Railway, Docker, Render, etc.
 * Never hardcode a production domain.
 */

import { API_PREFIX } from '../config/constants.js';

/**
 * Resolve the public base URL for the current request.
 * Respects X-Forwarded-Proto / X-Forwarded-Host when trust proxy is on.
 * @param {import('express').Request} req
 * @returns {string} e.g. "https://example.com" or "http://localhost:3000"
 */
export function getBaseUrl(req) {
  const proto = req.protocol || 'http';
  const host = req.get('host') || 'localhost';
  return `${proto}://${host}`;
}

/**
 * API root for the current request (includes /api/v1).
 * @param {import('express').Request} req
 * @returns {string}
 */
export function getApiBaseUrl(req) {
  return `${getBaseUrl(req)}${API_PREFIX}`;
}

/**
 * Self links for a paper resource.
 * @param {import('express').Request} req
 * @param {string} paperId
 * @returns {{ self: string, view: string, download: string, viewMemo: string, downloadMemo: string }}
 */
export function paperLinks(req, paperId) {
  const api = getApiBaseUrl(req);
  return {
    self: `${api}/papers/${paperId}`,
    view: `${api}/view/${paperId}`,
    download: `${api}/download/${paperId}`,
    viewMemo: `${api}/view/${paperId}?type=memo`,
    downloadMemo: `${api}/download/${paperId}?type=memo`,
  };
}
