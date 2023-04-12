import createError from 'http-errors';
import * as iframeService from './iframe.service';

/**
 * POST /auth/register-customer
 * Register customer request
 */
export const registerCustomer = async (req, res, next) => {
    try {
      const result = await iframeService.registerAsCustomer(req.body, req.dbInstance);
      if (result?.error && result?.message) {
        return next(createError(400, result.message));
      }
  
      return res.json({ success: true, message: "Customer registered successfully" });
    } catch (err) {
      next(err);
    }
  };
  