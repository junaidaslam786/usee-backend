import createError from 'http-errors';
import * as alertService from './alert.service';

/**
 * GET /customer/alert
 * Get all alerts created by customer against this customer's properties
 */
export const getCustomerAlerts = async (req, res, next) => {
  try {
    const result = await alertService.getCustomerAlerts(req.user.id, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('getCustomerAlertsError', err);
    return next(err);
  }
};

/**
 * GET /customer/unread-count
 * Get alert count of unread alerts
 */
export const getCustomerUnReadAlertCounts = async (req, res, next) => {
  try {
    const result = await alertService.getCustomerUnReadAlertCounts(req.user.id, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('getCustomerUnReadAlertCountsError', err);
    return next(err);
  }
};

/**
 * POST /customer/alert/create
 * Create alert for customer
 */
export const createCustomerAlert = async (req, res, next) => {
  try {
    const result = await alertService.createCustomerAlert(req.body, req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Alert created successfully" });
  } catch (err) {
    console.log('createCustomerAlertError', err);
    next(err);
  }
};

/**
 * DELETE /customer/alert/:id
 * Remove alert from customer feed
 */
export const removeCustomerAlert = async (req, res, next) => {
  try {
    const result = await alertService.removeCustomerAlert((req.params?.id ? req.params?.id : 0), req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Alert removed successfully" });
} catch (err) {
    console.log('removeCustomerAlertError', err);
    next(err);
}
};