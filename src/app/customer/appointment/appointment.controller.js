import createError from 'http-errors';
import * as appointmentService from './appointment.service';

/**
 * GET /customer/appointment/list
 * List all appointments
 */
export const listAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.listAppointments(req.user, req.query, req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listAppointmentError', err);
    return next(err);
  }
};

/**
 * GET /customer/appointment/:id
 * Get appointment detail by id
 */
export const getAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.getAppointment((req.params?.id ? req.params?.id : 0), req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getAppointmentError', err);
        next(err);
    }
};


/**
 * GET /customer/appointment/getSessionToken/:id
 * Get opentok token for the meeting session
 */
export const getSessionToken = async (req, res, next) => {
    try {
        const result = await appointmentService.getSessionToken((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }
        return res.json(result);
    } catch (err) {
        console.log('getSessionTokenError', err);
        next(err);
    }
  };