import createError from 'http-errors';
import * as branchService from './branch.service';

/**
 * GET /agent/branch/list
 * List all branches created by agent
 */
export const listAgentBranches = async (req, res, next) => {
    try {
      const result = await branchService.listAgentBranches(req.user, req.dbInstance);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listAgentBranchesError', err);
      return next(err);
    }
};

/**
 * POST /agent/branch/create
 * Create branch for the agents
 */
export const createAgentBranch = async (req, res, next) => {
    try {
        const result = await branchService.createAgentBranch(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(201).json(result);
    } catch (err) {
        console.log('createAgentBranchError', err);
        next(err);
    }
};

/**
 * PUT /agent/branch/update
 * Update branch of the agent
 */
export const updateAgentBranch = async (req, res, next) => {
    try {
        const result = await branchService.updateAgentBranch(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Branch updated successfully" });
    } catch (err) {
        console.log('updateAgentBranchError', err);
        next(err);
    }
};

/**
 * GET /agent/branch/:id
 * Get agent branch detail by id
 */
export const getAgentBranch = async (req, res, next) => {
    try {
        const result = await branchService.getAgentBranch((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getAgentBranchError', err);
        next(err);
    }
};

/**
 * DELETE /agent/branch/:id
 * Delete branch by id
 */
export const deleteAgentBranch = async (req, res, next) => {
    try {
        const result = await branchService.deleteAgentBranch((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Branch deleted successfully" });
    } catch (err) {
        console.log('deleteAgentBranchError', err);
        next(err);
    }
};