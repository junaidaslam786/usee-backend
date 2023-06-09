import createError from 'http-errors';
import * as userService from './user.service';

/**
 * GET /agent/user/list
 * List all users created by agent
 */
export const listAgentUsers = async (req, res, next) => {
    try {
      const result = await userService.listAgentUsers(req.dbInstance);
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
 * GET /agent/blocked
 * List all users created by agent
 */
export const listBlockedAgentUsers = async (req, res, next) => {
    try {
      const result = await userService.listBlockedAgentUsers(req.dbInstance);
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
 * PUT /agent/update-status
 * List all users created by agent
 */
export const updateAgentUserStatus = async (req, res, next) => {
    try {
        const result = await userService.updateAgentUserStatus(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Status updated successfully" });
    } catch (err) {
        console.log('updateAgentUserStatusError', err);
        next(err);
    }
};

/**
 * GET /agent/user/:id
 * Get agent user detail by id
 */
export const getAgentUser = async (req, res, next) => {

    try {
        const result = await userService.getAgentUser((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getAgentUserError', err);
        next(err);
    }
};

/**
 * DELETE /agent/user/:id
 * Delete user by id
 */
export const deleteAgentUser = async (req, res, next) => {
    try {
        const result = await userService.deleteAgentUser((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.log('deleteAgentUserError', err);
        next(err);
    }
};