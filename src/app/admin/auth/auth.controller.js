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
 * POST /auth/reset
 * Login request
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json({result, message: "A link has been sent to your email"});
  } catch (err) {
    console.log('loginError', err);
    return next(err);
  }
};

/**
 * PUT /auth/update-password
 * Login request
 */
export const updatePassword = async (req, res, next) => {
  try {
    const result = await authService.updatePassword(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json({result, message: "Your password has been updated successfully"});
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
 * POST /auth/register-admin
 * Register admin request
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
    const result = await authService.registerAsAgent(req, req.dbInstance);
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