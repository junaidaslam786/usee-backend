import createError from 'http-errors';
import * as appointmentService from './appointment.service';

/**
 * GET /agent/appointment/complete
 * List all appointments
 */
export const listCompletedAppointments = async (req, res, next) => {
  try {
    const result = await appointmentService.listCompletedAppointments(req.user, req.query, req.dbInstance);
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
