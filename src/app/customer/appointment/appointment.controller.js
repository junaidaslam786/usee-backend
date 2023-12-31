import createError from 'http-errors';
import * as appointmentService from './appointment.service';

/**
 * GET /customer/appointment/list
 * List all appointments
 */
export const listAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.listAppointments(req.user, req.query, req.dbInstance);
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
 * POST /agent/appointment/create
 * Create new appointment
 */
export const createAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.createAppointment(req, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(201).json(result);
    } catch (err) {
        console.log('createAppointmentError', err);
        next(err);
    }
};

/**
 * DELETE /appointment/:id
 * Delete appointment by id
 */
export const deleteAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.deleteAppointment((req.params?.id ? req.params?.id : 0), req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Appointment deleted successfully" });
    } catch (err) {
        console.log('deleteAppointmentError', err);
        next(err);
    }
};

// /**
//  * PUT /agent/appointment/update
//  * update appointment details and permissions
//  */
// export const updateAppointment = async (req, res, next) => {
//     try {
//         const result = await appointmentService.updateAppointment(req, req.dbInstance);
//         if (result?.error && result?.message) {
//             return next(createError(400, result.message));
//         }

//         return res.json({ success: true, message: "Appointment updated successfully" });
//     } catch (err) {
//         console.log('updateAppointmentError', err);
//         next(err);
//     }
// };

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

/**
 * POST /customer/appointment/check-availability
 * Check if agent or agent user and customer is available for appointment or not
 */
export const checkAvailability = async (req, res, next) => {
    try {
        const result = await appointmentService.checkAvailability(req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: result });
    } catch (err) {
        console.log('checkAvailabilityError', err);
        next(err);
    }
};
