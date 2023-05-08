import createError from 'http-errors';
import * as dashboardService from './dashboard.service';

/**
 * POST /customer/dashboard
 * Dashboard data
 */
export const dashboardData = async (req, res, next) => {
  try {
    const result = await dashboardService.dashboardData(req.body, req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('dashboardDataError', err);
    return next(err);
  }
};