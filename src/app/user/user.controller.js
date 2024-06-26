import createError from 'http-errors';
import * as userService from './user.service';

/**
 * GET /user/profile
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    const result = await userService.getCurrentUser(req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /user/profile
 * Update current user
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const result = await userService.updateCurrentUser(req.body, req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Profile updated successfully", token: result });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /user/:id
 * Get basic user details without authentication
 */
export const getUserBasicDetails = async (req, res, next) => {
  try {
    const result = await userService.getUserBasicDetails(req.params.id, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('getUserBasicDetailsError', err);
    return next(err);
  }
}

/**
 * DELETE /user/profile
 * Delete current user
 */
export const deleteCurrentUser = async (req, res, next) => {
  try {
    await req.user.destroy();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /user/update-password
 * Update password of current user
 */
export const updatePassword = async (req, res, next) => {
  try {
    const result = await userService.updatePassword(req.user, req.body);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /user/list-customer
 * List all customers in the system
 */
export const listCustomerUsers = async (req, res, next) => {
  try {
    const result = await userService.listCustomerUsers(req.user, req.query, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listCustomerUsersError', err);
    return next(err);
  }
};

/**
 * POST /user/validate-opt
 * Validate user Otp 
 */
 export const validateOtp = async (req, res, next) => {
  try {
    const result = await userService.validateOtp(req.user, req.body);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * PUT /user/update-timezone
 * Update timezone of current user
 */
export const updateTimezone = async (req, res, next) => {
  try {
    const result = await userService.updateTimezone(req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
};

/**
 * POST /user/call-background-image
 * Upload user call background images
 */
export const uploadCallBackgroundImages = async (req, res, next) => {
  try {
    const result = await userService.uploadCallBackgroundImages(req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    res.status(200).json(result);
  } catch (err) {
    console.log('uploadCallBackgroundImagesError', err);
    next(err);
  }
};

/**
 * DELETE /user/call-background-image
 * Delete user call background images
 */
export const deleteCallBackgroundImage = async (req, res, next) => {
  try {
    const result = await userService.deleteCallBackgroundImage(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Call Background image deleted successfully" });
  } catch (err) {
    console.log('deleteCallBackgroundImageError', err);
    next(err);
  }
};

/**
 * POST /user/verify-password
 * Verify user password
 */
export const verifyPassword = async (req, res, next) => {
  try {
    const result = await userService.verifyPassword(req.user, req.body);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Password verified successfully"});
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /user/:id
 * Delete user by id
 */
export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req.dbInstance, req);
    if (result?.error && result?.message) {
      return next(createError(400, result));
    }

    return res.json({ success: true, message: "User deleted successfully"});
  } catch (err) {
    console.log('deleteUserError', err);
    next(err);
  }
}
