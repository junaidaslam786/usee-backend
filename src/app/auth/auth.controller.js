import createError from 'http-errors';
import * as authService from './auth.service';

/**
 * POST /auth/login
 * Login request
 */
export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('loginError', err);
    return next(err);
  }
};

/**
 * POST /auth/agent-onboarding
 * Agent onboarding request
 */
export const agentOnboarding = async (req, res, next) => {
  try {
    const result = await authService.agentOnboarding(req, req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('userOnboardingError', err);
    return next(err);
  }
};

/**
 * POST /auth/customer-onboarding
 * Customer onboarding request
 */
export const customerOnboarding = async (req, res, next) => {
  try {
    const result = await authService.customerOnboarding(req, req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
    return res.status(200).json(result);
  } catch (err) {
    console.log('customerOnboardingError', err);
    return next(err);
  }
};

/**
 * POST /auth/register-agent
 * Register agent request
 */
export const registerAgent = async (req, res, next) => {
  try {
    const result = await authService.registerAsAgent(req, req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/register-customer
 * Register customer request
 */
export const registerCustomer = async (req, res, next) => {
  try {
    const result = await authService.registerAsCustomer(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /auth/forgot-password
 * Request to reset user password
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.query, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Change password email sent" });
  } catch (err) {
    console.log('forgotPasswordError', err);
    return next(err);
  }
};

/**
 * POST /auth/reset-password
 * Reset password of the user
 */
export const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
    
    return res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.log('resetPasswordError', err);
    return next(err);
  }
};

/**
 * POST /auth/send-otp
 * Send Otp to the user
 */
 export const sendOtp = async (req, res, next) => {
  try {
    const result = await authService.sendOtp(req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
    
    return res.json({ success: true, message: "Otp sent successfully" });
  } catch (err) {
    console.log('sendOtpError', err);
    return next(err);
  }
};

/**
 * GET /auth/check-field-exist
 * Check if provided field already exists
 */
export const checkFieldExists = async (req, res, next) => {
  try {
    const result = await authService.checkFieldExists(req.query, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true });
  } catch (err) {
    console.log('checkFieldExistsError', err);
    return next(err);
  }
};

/**
 * GET /auth/check-field-exist
 * Check if provided field already exists
 */
export const fetchTokenPrice = async (req, res, next) => {
  try {
    const result = await authService.fetchTokenPrice(req, req.body.configKey);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json(result);
  } catch (err) {
    console.log('checkFieldExistsError', err);
    return next(err);
  }
};