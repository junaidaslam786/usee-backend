import createError from 'http-errors';
import * as roleService from './role.service';

/**
 * GET /role/list
 * List all roles
 */
export const listRoles = async (req, res, next) => {
  try {
    const result = await roleService.listRoles(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listRoleError', err);
    return next(err);
  }
};

/**
 * GET /role/:id
 * Get role detail by id
 */
export const getRole = async (req, res, next) => {
    try {
        const result = await roleService.getRole((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getRoleError', err);
        next(err);
    }
};

/**
 * POST /role
 * Create new role with permissions
 */
export const createRole = async (req, res, next) => {
    try {
        const result = await roleService.createRole(req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(201).json(result);
    } catch (err) {
        console.log('getRoleError', err);
        next(err);
    }
};

/**
 * PUT /role/update
 * update role details and permissions
 */
export const updateRole = async (req, res, next) => {
    try {
        const result = await roleService.updateRole(req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Role updated successfully" });
    } catch (err) {
        console.log('getRoleError', err);
        next(err);
    }
};

/**
 * DELETE /role/:id
 * Delete role by id
 */
export const deleteRole = async (req, res, next) => {
    try {
        const result = await roleService.deleteRole((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Role deleted successfully" });
    } catch (err) {
        console.log('deleteRoleError', err);
        next(err);
    }
};
