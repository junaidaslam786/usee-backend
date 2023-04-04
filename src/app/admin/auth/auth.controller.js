import createError from 'http-errors';
import * as authService from './auth.service';
import * as userService from '../user/user.service';

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
 * GET /agent/user/list
 * List all users created by agent
 */
export const listAgentUsers = async (req, res, next) => {
  try {
    const result = await userService.listAgentUsers(req.user, req.query, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listAgentUsersError', err);
    return next(err);
  }
};

/**
 * POST /auth/register-agent
 * Register agent request
 */
export const registerAdmin = async (req, res, next) => {
  try {
    const result = await authService.registerAsAdmin(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /auth/register-agent
 * Register agent request
 */
export const registerAgent = async (req, res, next) => {
  try {
    const result = await authService.registerAsAgent(req.body, req.dbInstance);
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
 * POST /auth/forgot-password
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
