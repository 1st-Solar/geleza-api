/**
 * @fileoverview Paper controllers.
 */

import * as paperService from '../services/paperService.js';
import { parsePagination, parsePositiveInt } from '../utils/pagination.js';
import { parseSort } from '../utils/sorting.js';
import { parseFilters } from '../utils/filtering.js';
import { validatePaperQuery } from '../middleware/validation.js';
import { getApiBaseUrl, paperLinks } from '../utils/requestUrl.js';
import { fetchDrivePdf } from '../utils/googleDrive.js';
import { httpError } from '../middleware/errors.js';
import { ErrorCode } from '../config/constants.js';

/**
 * GET /api/v1/papers
 * @type {import('express').RequestHandler}
 */
export async function listPapers(req, res, next) {
  try {
    validatePaperQuery(req.query);
    const { page, limit, offset } = parsePagination(req.query);
    const sort = parseSort(req.query);
    const filters = parseFilters(req.query);

    const result = paperService.listPapers({
      filters,
      sort,
      offset,
      limit,
      page,
    });

    res.json({ success: true, data: result.data, meta: result.meta });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/papers/:id
 * @type {import('express').RequestHandler}
 */
export async function getPaper(req, res, next) {
  try {
    const paper = paperService.getPaperById(req.params.id);
    res.json({
      success: true,
      data: {
        ...paper,
        links: paperLinks(req, paper.id),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/grades
 * @type {import('express').RequestHandler}
 */
export async function grades(req, res, next) {
  try {
    res.json({ success: true, data: paperService.getGrades() });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/subjects?grade=12
 * @type {import('express').RequestHandler}
 */
export async function subjects(req, res, next) {
  try {
    validatePaperQuery(req.query);
    const grade = req.query.grade
      ? parsePositiveInt(req.query.grade, NaN)
      : undefined;
    res.json({
      success: true,
      data: paperService.getSubjects(
        Number.isFinite(grade) ? grade : undefined
      ),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/years
 * @type {import('express').RequestHandler}
 */
export async function years(req, res, next) {
  try {
    validatePaperQuery(req.query);
    const filters = parseFilters(req.query, [
      'grade',
      'subject',
      'session',
      'province',
    ]);
    res.json({ success: true, data: paperService.getYears(filters) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/sessions
 * @type {import('express').RequestHandler}
 */
export async function sessions(req, res, next) {
  try {
    validatePaperQuery(req.query);
    const filters = parseFilters(req.query, ['grade', 'subject', 'year']);
    res.json({ success: true, data: paperService.getSessions(filters) });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/provinces
 * @type {import('express').RequestHandler}
 */
export async function provinces(req, res, next) {
  try {
    validatePaperQuery(req.query);
    const filters = parseFilters(req.query, [
      'grade',
      'subject',
      'year',
      'session',
    ]);
    res.json({ success: true, data: paperService.getProvinces(filters) });
  } catch (err) {
    next(err);
  }
}

/**
 * Stream a paper PDF through this API (never expose Drive to the client).
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {'inline'|'attachment'} disposition
 */
async function streamPaperPdf(req, res, disposition) {
  const id = req.params.id;
  if (!id || !String(id).trim()) {
    throw httpError(400, 'Paper id is required', ErrorCode.VALIDATION_ERROR);
  }

  const type = req.query.type === 'memo' ? 'memo' : 'pdf';
  const { sourceUrl, kind } = paperService.resolveSourceUrl(id, type);
  const { buffer, contentType, size } = await fetchDrivePdf(sourceUrl);

  const filename =
    kind === 'memo' ? `geleza-${id}-memo.pdf` : `geleza-${id}.pdf`;

  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', String(size));
  res.setHeader(
    'Content-Disposition',
    `${disposition}; filename="${filename}"`
  );
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).end(buffer);
}

/**
 * GET /api/v1/download/:id?type=pdf|memo
 * Streams the PDF bytes. Optional format=json returns metadata only.
 * @type {import('express').RequestHandler}
 */
export async function download(req, res, next) {
  try {
    if (req.query.format === 'json') {
      const type = req.query.type === 'memo' ? 'memo' : 'pdf';
      const info = paperService.getDownloadInfo(
        req.params.id,
        type,
        getApiBaseUrl(req)
      );
      res.json({ success: true, data: info });
      return;
    }
    await streamPaperPdf(req, res, 'attachment');
  } catch (err) {
    // Map Drive helper errors onto HTTP errors when status is set
    if (err.status && !err.code?.startsWith?.('ERR')) {
      return next(
        httpError(
          err.status,
          err.message,
          err.code || ErrorCode.INTERNAL
        )
      );
    }
    next(err);
  }
}

/**
 * GET /api/v1/view/:id?type=pdf|memo
 * Streams the PDF for inline display (iframe / WebView).
 * Optional format=json returns metadata only.
 * @type {import('express').RequestHandler}
 */
export async function view(req, res, next) {
  try {
    if (req.query.format === 'json') {
      const type = req.query.type === 'memo' ? 'memo' : 'pdf';
      const info = paperService.getDownloadInfo(
        req.params.id,
        type,
        getApiBaseUrl(req)
      );
      res.json({ success: true, data: info });
      return;
    }
    await streamPaperPdf(req, res, 'inline');
  } catch (err) {
    if (err.status && !err.code?.startsWith?.('ERR')) {
      return next(
        httpError(
          err.status,
          err.message,
          err.code || ErrorCode.INTERNAL
        )
      );
    }
    next(err);
  }
}
