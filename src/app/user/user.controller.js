import createError from 'http-errors';
import * as userService from './user.service';

/**
 * GET /user/profile
 * Get current user
 */
export const getCurrentUser = async (req, res, next) => {
  try {
    delete req.user.dataValues.password;
    res.json(req.user);
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
    await userService.updateCurrentUser(req.body, req.dbInstance);

    res.status(200).json({ success: true });
  } catch (err) {
    next(err);
  }
};

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