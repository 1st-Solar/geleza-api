/**
 * @fileoverview Paper-related HTTP controllers.
 * Controllers parse request → call service → send response.
 * They never touch the data source directly.
 */

import * as paperService from '../services/paperService.js';
import {
  parsePagination,
  parseSort,
  parseFilters,
  parsePositiveInt,
} from '../utils/queryHelpers.js';

/**
 * GET /papers
 * @type {import('express').RequestHandler}
 */
export async function listPapers(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const sort = parseSort(req.query);
    const filters = parseFilters(req.query, [
      'grade',
      'subject',
      'year',
      'session',
      'province',
      'assessmentType',
      'paper',
      'language',
    ]);

    const result = paperService.listPapers({
      filters,
      sort,
      offset,
      limit,
      page,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /papers/:id
 * @type {import('express').RequestHandler}
 */
export async function getPaper(req, res, next) {
  try {
    const paper = paperService.getPaperById(req.params.id);
    res.json(paper);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /search?q=...
 * @type {import('express').RequestHandler}
 */
export async function search(req, res, next) {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const result = paperService.searchPapers(req.query.q, {
      offset,
      limit,
      page,
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /stats
 * @type {import('express').RequestHandler}
 */
export async function stats(req, res, next) {
  try {
    res.json(paperService.getStats());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /grades
 * @type {import('express').RequestHandler}
 */
export async function grades(req, res, next) {
  try {
    res.json(paperService.getGrades());
  } catch (err) {
    next(err);
  }
}

/**
 * GET /subjects?grade=12
 * @type {import('express').RequestHandler}
 */
export async function subjects(req, res, next) {
  try {
    const grade = req.query.grade
      ? parsePositiveInt(req.query.grade, undefined)
      : undefined;
    res.json(paperService.getSubjects(grade));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /years?grade=12&subject=Mathematics
 * @type {import('express').RequestHandler}
 */
export async function years(req, res, next) {
  try {
    const grade = req.query.grade
      ? parsePositiveInt(req.query.grade, undefined)
      : undefined;
    const subject = req.query.subject
      ? String(req.query.subject)
      : undefined;
    res.json(paperService.getYears(grade, subject));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /sessions?grade=12&subject=Mathematics&year=2025
 * @type {import('express').RequestHandler}
 */
export async function sessions(req, res, next) {
  try {
    const grade = req.query.grade
      ? parsePositiveInt(req.query.grade, undefined)
      : undefined;
    const subject = req.query.subject
      ? String(req.query.subject)
      : undefined;
    const year = req.query.year
      ? parsePositiveInt(req.query.year, undefined)
      : undefined;
    res.json(paperService.getSessions(grade, subject, year));
  } catch (err) {
    next(err);
  }
}
