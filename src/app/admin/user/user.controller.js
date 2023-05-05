import createError from 'http-errors';
import * as userService from './user.service';

/**
 * PUT /user/update
 * Update current user
 */
export const updateCurrentUser = async (req, res, next) => {
  try {
    const result = await userService.updateCurrentUser(req.body, req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json({ success: true, message: "Profile updated successfully", result });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /user/:id
 * Get current user
 */
export const getUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById((req.params?.id ? req.params?.id : 0), req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json(result);
} catch (err) {
    console.log('deleteUserError', err);
    next(err);
};
}

/**
 * DELETE /user/profile
 * Delete current user
 */
export const deleteCurrentUser = async (req, res, next) => {
  try {
    const result = await userService.deleteCustomer((req.params?.id ? req.params?.id : 0), req);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "User deleted successfully" });
} catch (err) {
    console.log('deleteUserError', err);
    next(err);
};
}

/**
 * GET /user/list-all
 * List all customers in the system
 */
export const listAdminUsers = async (req, res, next) => {
  try {
    const result = await userService.listAdminUsers(req.dbInstance);
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
 * GET /user/list-customer
 * List all customers in the system
 */
export const listCustomerUsers = async (req, res, next) => {
  try {
    const result = await userService.listCustomerUsers(req.dbInstance);
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
 * GET /user/list-customer
 * List all customers in the system
 */
export const totalCustomers = async (req, res, next) => {
  try {
    const result = await userService.totalCustomers(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }
    return res.status(200).json(result);
  } catch (err) {
    console.log('totalCustomerUsersError', err);
    return next(err);
  }
};