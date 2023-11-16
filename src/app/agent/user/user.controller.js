import createError from 'http-errors';
import * as userService from './user.service';

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
 * GET /agent/user/to-allocate
 * List all users created by agent to allocate to properties
 */
export const listAgentUsersToAllocate = async (req, res, next) => {
    try {
      const result = await userService.listAgentUsersToAllocate(req);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listAgentUsersToAllocateError', err);
      return next(err);
    }
};

/**
 * POST /agent/user/create
 * Create user by agent
 */
export const createAgentUser = async (req, res, next) => {
    try {
        const result = await userService.createAgentUser(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(201).json(result);
    } catch (err) {
        console.log('createAgentUsersError', err);
        next(err);
    }
};

/**
 * PUT /agent/user/update-branch
 * Update branch of the agent
 */
export const updateAgentUserBranch = async (req, res, next) => {
    try {
        const result = await userService.updateAgentUserBranch(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Branch updated successfully" });
    } catch (err) {
        console.log('updateAgentUserBranchError', err);
        next(err);
    }
};

/**
 * PUT /agent/user/update-sorting
 * Update branch of the agent
 */
export const updateAgentUserSorting = async (req, res, next) => {
    try {
        const result = await userService.updateAgentUserSorting(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Sorting updated successfully" });
    } catch (err) {
        console.log('updateAgentUserSortingError', err);
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

/**
 * PUT /agent/user/update
 * Update user by agent
 */
export const updateAgentUser = async (req, res, next) => {
    try {
        const result = await userService.updateAgentUser(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
        console.log('createAgentUsersError', err);
        next(err);
    }
};

/**
 * GET /agent/user/:userId/tokens
 * Get user tokens by user id
 */
export const getUserTokens = async (req, res, next) => {
    try {
        const result = await userService.getUserTokens(req.params?.userId, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.status(200).json(result);
    } catch (err) {
        console.log('createAgentUsersError', err);
        next(err);
    }
}

/**
 * GET /agent/user/:userId/token-transactions
 * Get user token transactions by user id
 */
export const getUserTokenTransactions = async (req, res, next) => {
    try {
        const result = await userService.getUserTokenTransactions(req.params?.userId, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.status(200).json(result);
    } catch (err) {
        console.log('createAgentUsersError', err);
        next(err);
    }
}