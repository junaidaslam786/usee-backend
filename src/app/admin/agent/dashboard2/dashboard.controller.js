import createError from 'http-errors';
import * as dashboardService from './dashboard.service';

/**
 * POST /agent/dashboard
 * Dashboard data
 */
export const dashboardData = async (req, res, next) => {
  try {
    const result = await dashboardService.dashboardData(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result.totalItems);
  } catch (err) {
    console.log('dashboardDataError', err);
    return next(err);
  }
};
export const agentCount = async (req, res, next) => {
  try {
    const result = await dashboardService.agentCount(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('dashboardDataError', err);
    return next(err);
  }
};

export const customerCount = async (req, res, next) => {
  try {
    const result = await dashboardService.customerCount(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('dashboardDataError', err);
    return next(err);
  }
};

export const propertyCount = async (req, res, next) => {
  try {
    const result = await dashboardService.propertyCount(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('dashboardDataError', err);
    return next(err);
  }
};


export const appointmentCount = async (req, res, next) => {
  try {
    const result = await dashboardService.appointmentCount(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('dashboardDataError', err);
    return next(err);
  }
};