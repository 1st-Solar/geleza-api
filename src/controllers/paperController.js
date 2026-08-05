/**
 * @fileoverview Paper controllers.
 */

import * as paperService from '../services/paperService.js';
import { parsePagination, parsePositiveInt } from '../utils/pagination.js';
import { parseSort } from '../utils/sorting.js';
import { parseFilters } from '../utils/filtering.js';
import { validatePaperQuery } from '../middleware/validation.js';
import { getApiBaseUrl, paperLinks } from '../utils/requestUrl.js';

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
 * GET /api/v1/download/:id?type=pdf|memo
 * @type {import('express').RequestHandler}
 */
export async function download(req, res, next) {
  try {
    const type = req.query.type === 'memo' ? 'memo' : 'pdf';
    const info = paperService.getDownloadInfo(
      req.params.id,
      type,
      getApiBaseUrl(req)
    );
    res.json({ success: true, data: info });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/view/:id?type=pdf|memo
 * Redirects to the PDF URL (or returns metadata if prefer JSON).
 * @type {import('express').RequestHandler}
 */
export async function view(req, res, next) {
  try {
    const type = req.query.type === 'memo' ? 'memo' : 'pdf';
    const info = paperService.getDownloadInfo(
      req.params.id,
      type,
      getApiBaseUrl(req)
    );

    // If client asks for JSON, return metadata; otherwise redirect
    if (req.query.format === 'json') {
      res.json({ success: true, data: info });
      return;
    }
    res.redirect(302, info.url);
  } catch (err) {
    next(err);
  }
}
