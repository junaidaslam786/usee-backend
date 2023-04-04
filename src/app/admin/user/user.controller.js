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
    const result = await userService.updateCurrentUser(req.body, req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Profile updated successfully" });
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

/* GET /agent/user/list
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
export const listAdminUsers = async (req, res, next) => {
  try {
    const result = await userService.listAdminUsers(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listAgentUsersError', err);
    return next(err);
  }
};

export const agentUsersByID = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.params.id);
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
    console.log('listCustomerUsersError', err);
    return next(err);
  }
};