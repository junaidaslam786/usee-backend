import createError from 'http-errors';
import * as homeService from '../home/home.service';

/**
 * GET /
 * Home page
 */
export const index = (req, res) => res.json({ message: "App is online!" });

/**
 * GET /health
 * Health check
 */
export const healthCheck = (req, res) => res.json({ success: true });

/**
 * POST /home/book-demo
 * Send customer details to book a demo
 */
export const bookDemo = async (req, res, next) => {
    try {
      const result = await homeService.bookDemo(req.body, req);
      if (result?.error && result?.message) {
        return next(createError(400, result.message));
      }
  
      return res.json({ success: true, message: "Demo is booked successfully" });
    } catch (err) {
      console.log('bookDemoError', err);
      return next(err);
    }
};

/**
 *  POST /home/contact-us
 *  Save contact us information of the user
 */
 export const contactUs = async (req, res, next) => {
    try {
      const result = await homeService.contactUs(req.body, req);
      if (result?.error && result?.message) {
        return next(createError(400, result.message));
      }
  
      return res.json({ success: true, message: "Contact us information saved successfully" });
    } catch (err) {
      console.log('saveContactUsInfoError', err);
      return next(err);
    }
};
