import createError from 'http-errors';
import * as availabilityService from './availability.service';

/**
 * GET /agent/availability/list
 * List availability added by agent
 */
export const listAgentAvailability = async (req, res, next) => {
    try {
      const result = await availabilityService.listAgentAvailability(req.user, req.dbInstance);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listAgentAvailabilityError', err);
      return next(err);
    }
};

/**
 * PUT /agent/availability/update
 * Update availability of the agent
 */
export const updateAgentAvailability = async (req, res, next) => {
    try {
        const result = await availabilityService.updateAgentAvailability(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Availability updated successfully" });
    } catch (err) {
        console.log('updateAgentAvailabilityError', err);
        next(err);
    }
};

/**
 * GET /agent/availability/list-slots
 * List availability slots added by agent
 */
export const listAgentAvailabilitySlots = async (req, res, next) => {
    try {
      const result = await availabilityService.listAgentAvailabilitySlots(req);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listAgentAvailabilitySlotsError', err);
      return next(err);
    }
};
