/**
 * @fileoverview Centralised error-handling middleware.
 */

/**
 * Create an HTTP error with status code.
 * @param {number} status
 * @param {string} message
 * @returns {Error & { status: number }}
 */
export function httpError(status, message) {
  const err = /** @type {Error & { status: number }} */ (new Error(message));
  err.status = status;
  return err;
}

/**
 * 404 handler – must be registered after all routes.
 * @type {import('express').RequestHandler}
 */
export function notFoundHandler(req, res, next) {
  next(httpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

/**
 * Global error handler – must be registered last.
 * @type {import('express').ErrorRequestHandler}
 */
export function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  if (status >= 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({
    error: {
      status,
      message,
    },
  });
}

export default { httpError, notFoundHandler, errorHandler };
