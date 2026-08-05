/**
 * @fileoverview Simple in-process TTL cache for expensive aggregate queries.
 * Not a replacement for Redis – just avoids re-scanning the full array
 * for identical facet requests within a short window.
 */

/** @type {Map<string, { value: unknown, expires: number }>} */
const store = new Map();

const DEFAULT_TTL_MS = 60_000;

/**
 * @param {string} key
 * @returns {unknown|undefined}
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

/**
 * @param {string} key
 * @param {unknown} value
 * @param {number} [ttlMs]
 */
export function cacheSet(key, value, ttlMs = DEFAULT_TTL_MS) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

/**
 * Clear the entire cache (e.g. after a data reload).
 */
export function cacheClear() {
  store.clear();
}
