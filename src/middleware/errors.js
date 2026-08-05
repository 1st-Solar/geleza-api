/**
 * @fileoverview Error helpers and global Express error middleware.
 */

import { ErrorCode } from '../config/constants.js';

/**
 * @param {number} status
 * @param {string} message
 * @param {string} [code]
 * @returns {Error & { status: number, code: string }}
 */
export function httpError(status, message, code) {
  const err = /** @type {Error & { status: number, code: string }} */ (
    new Error(message)
  );
  err.status = status;
  err.code =
    code ||
    (status === 404
      ? ErrorCode.NOT_FOUND
      : status === 400
        ? ErrorCode.BAD_REQUEST
        : ErrorCode.INTERNAL);
  return err;
}

/**
 * @type {import('express').RequestHandler}
 */
export function notFoundHandler(req, _res, next) {
  next(
    httpError(404, `Route not found: ${req.method} ${req.originalUrl}`, ErrorCode.NOT_FOUND)
  );
}

/**
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const code = err.code || ErrorCode.INTERNAL;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[ERROR]', {
      message: err.message,
      stack: err.stack,
      code,
    });
  }

  res.status(status).json({
    success: false,
    error: { code, message },
  });
}

export default { httpError, notFoundHandler, errorHandler };
