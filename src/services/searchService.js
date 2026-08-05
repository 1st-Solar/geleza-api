/**
 * @fileoverview Search service.
 */

import * as repo from '../repositories/paperRepository.js';
import { paginatedMeta } from '../utils/pagination.js';

/**
 * @param {string} q
 * @param {object} options
 * @returns {{ data: Array, meta: object }}
 */
export function search(q, options) {
  const { data, total } = repo.search(q, options);
  return {
    data,
    meta: paginatedMeta(total, options.page || 1, options.limit || 20),
  };
}

export function getStats() {
  return repo.getStats();
}

export default { search, getStats };
