import createError from 'http-errors';
import * as agentService from './agent.service';

/**
 * GET /agent/users/list
 * List all users created by agent
 */
export const listAgentUsers = async (req, res, next) => {
    try {
      const result = await agentService.listAgentUsers(req.user, req.query, req.dbInstance);
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
 * POST /agent/users/create
 * Create user by agent
 */
export const createAgentUsers = async (req, res, next) => {
    try {
        const result = await agentService.createAgentUsers(req.body, req);
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
 * PUT /agent/users/update-branch
 * Update branch of the agent
 */
export const updateAgentUserBranch = async (req, res, next) => {
    try {
        const result = await agentService.updateAgentUserBranch(req.body, req);
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
 * PUT /agent/users/update-sorting
 * Update branch of the agent
 */
export const updateAgentUserSorting = async (req, res, next) => {
    try {
        const result = await agentService.updateAgentUserSorting(req.body, req);
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
 * GET /agent/users/:id
 * Get agent user detail by id
 */
export const getAgentUser = async (req, res, next) => {
    try {
        const result = await agentService.getAgentUser((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getPropertyError', err);
        next(err);
    }
};

/**
 * DELETE /agent/users/:id
 * Delete user by id
 */
export const deleteAgentUser = async (req, res, next) => {
    try {
        const result = await agentService.deleteAgentUser((req.params?.id ? req.params?.id : 0), req.dbInstance);
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
 * GET /agent/alert
 * Get all alerts created by customer against this agent's properties
 */
export const getAgentAlerts = async (req, res, next) => {
  try {
    const result = await agentService.getAgentAlerts(req.user.id, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('getAgentAlertsError', err);
    return next(err);
  }
};

/**
 * DELETE /agent/alert/:id
 * Remove alert from agent feed
 */
export const removeAgentAlert = async (req, res, next) => {
  try {
    const result = await agentService.removeAgentAlert((req.params?.id ? req.params?.id : 0), req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Alert removed successfully" });
} catch (err) {
    console.log('removeAgentAlertError', err);
    next(err);
}
};