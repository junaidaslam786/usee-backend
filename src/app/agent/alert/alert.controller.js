import createError from 'http-errors';
import * as alertService from './alert.service';

/**
 * GET /agent/alert
 * Get all alerts created by customer against this agent's properties
 */
export const getAgentAlerts = async (req, res, next) => {
  try {
    const result = await alertService.getAgentAlerts(req.user.id, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('getAgentAlertsError', err);
    return next(err);
  }
};

/**
 * POST /agent/alert/create
 * Create alert for agent
 */
export const createAgentAlert = async (req, res, next) => {
  try {
    const result = await alertService.createAgentAlert(req.body, req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Alert created successfully" });
  } catch (err) {
    console.log('createAgentAlertError', err);
    next(err);
  }
};

/**
 * DELETE /agent/alert/:id
 * Remove alert from agent feed
 */
export const removeAgentAlert = async (req, res, next) => {
  try {
    const result = await alertService.removeAgentAlert((req.params?.id ? req.params?.id : 0), req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Alert removed successfully" });
} catch (err) {
    console.log('removeAgentAlertError', err);
    next(err);
}
};