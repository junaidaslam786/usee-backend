import createError from 'http-errors';
import * as iframeService from './iframe.service';
import * as userService from '../agent/user/user.service';

/**
 * POST /iframe/wishlist
 * Create new customer and add property to their wishlist
 */
export const addToWishlist = async (req, res, next) => {
    try {
      const result = await iframeService.addToWishlist(req.body, req.dbInstance);
      if (result?.error && result?.message) {
        return next(createError(400, result.message));
      }
  
      return res.json({ success: true, message: "Property added to wishlist" });
    } catch (err) {
      console.log('addToWishlistError', err);
      return next(err);
    }
};

/**
 * POST /iframe/wishlist
 * Create new customer and add appointment
 */
export const addAppointment = async (req, res, next) => {
  try {
    const result = await iframeService.addAppointment(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Appointment created successfully" });
  } catch (err) {
    console.log('addAppointmentError', err);
    return next(err);
  }
};

/**
 * GET /iframe/list-slots
 * List availability slots added by agent
 */
export const listAvailabilitySlots = async (req, res, next) => {
  try {
    const result = await iframeService.listAvailabilitySlots(req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listAvailabilitySlotsError', err);
    return next(err);
  }
};

/**
 * POST /iframe/check-availability
 * Check if agent is available for appointment or not
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const result = await userService.checkAvailability(req.body, req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: result });
  } catch (err) {
    console.log('checkAvailabilityError', err);
    next(err);
  }
};
  