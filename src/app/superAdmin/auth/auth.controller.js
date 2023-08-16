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
    const result = await authService.updatePassword(req, req.dbInstance);
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

/**
 * POST /superadmin/auth/refresh
 * Endpoint to handle token refresh for superadmins.
 *
 * @param {Object} req - Express request object. Expects a 'refreshToken' in the request body.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 *
 * @returns {Object} - If successful, returns a new access token. Otherwise, returns an error message.
 */
export const refreshToken = async (req, res, next) => {
  // Extract the refreshToken from the request body
  const { refreshToken } = req.body;

  // Call the refreshTokenService from authService to validate the refreshToken 
  // and generate a new access token
  const result = await authService.refreshTokenService(refreshToken);

  // If there's an error in the result, pass it to the error handling middleware
  if (result.error) {
    return next(createError(400, result.message));
  }

  // If successful, return the new token with a 200 status
  return res.status(200).json(result);
};
