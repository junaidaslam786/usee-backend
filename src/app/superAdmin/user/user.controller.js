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

export const blockTraderById = async (req, res, next) => {
  try {
    const traderId = req.params.id; // Get the trader ID from the request parameters
    const result = await userService.blockTraderById(traderId, req.dbInstance);

    if (result?.error) {
      return next(createError(400, result.message));
    }

    return res.status(200).json({ message: 'Trader successfully blocked.' });
  } catch (err) {
    console.log('blockTraderByIdError', err);
    return next(err);
  }
};
/**
 * PUT /user/update/:id
 * Update user by id
 */
export const updateUserById = async (req, res, next) => {
  try {
    const result = await userService.updateUserById(req.body, req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json({ success: true, message: "User updated successfully", result });
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
 * PUT /:id/activate
 * Activate user by id
 */
export const activateUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.body, req);
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
 * PUT /:id/deactivate
 * Deactivate user by id
 */
export const deactivateUserById = async (req, res, next) => {
  try {
    const result = await userService.getUserById(req.body, req);
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
 * DELETE /user/:id
 * Delete user
 */
export const deleteUser = async (req, res, next) => {
  try {
    const result = await userService.deleteUser(req);
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

/** (For Super Admins)
 * GET /user/list-all
 * List all customers in the system
 */
export const listUsersExceptSuperAdmin = async (req, res, next) => {
  try {
    const result = await userService.listUsersExceptSuperAdmin(req.dbInstance);
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

/** 
 * GET /user/superadmin-details
 * Retrieve super admin details 
 */
export const getSuperAdminDetails = async (req, res, next) => {
  try {
    const result = await userService.getSuperAdminDetails(req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
    return res.status(200).json(result);
  } catch (err) {
    console.log('getSuperAdminDetailsError', err);
    next(err);
  }
};

/**
 * GET /superadmin/user/list-trader-users
 * List all users created by agent
 */
export const listAgentUsers = async (req, res, next) => {
  try {
    const result = await userService.listAgentUsers(req.params, req.dbInstance);
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
 * PUT /superadmin/user/update
 * Update superadmin user details
 */
export const updateSuperAdminDetails = async (req, res, next) => {
  try {
    // Ensure that the user performing the action has superadmin privileges.
    if (!req.user || req.user.role !== 'superadmin') {
      return next(createError(403, "Unauthorized to update superadmin details."));
    }

    const result = await userService.updateSuperAdminDetails(req.body, req);

    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }

    return res.status(200).json({ success: true, message: "Superadmin details updated successfully", result });
  } catch (err) {
    console.log('updateSuperAdminDetailsError', err);
    next(err);
  }
};

export const uploadUserProfileImage = async (req, res, next) => {
  try {
    // 1. Check if the image is present in the request
    if (!req.files || !req.files.image) {
      return next(createError(400, "Image file is required"));
    }

    // 2. Extract the image file
    const imageFile = req.files.image;

    // 3. Handle any processing or validation (like checking file type, size, etc.)
    // (This is a basic example; you can expand on it based on your needs.)
    if (imageFile.mimetype !== "image/jpeg" && imageFile.mimetype !== "image/png") {
      return next(createError(400, "Only JPEG or PNG images are allowed"));
    }

    const userId = req.body.id;
    // 4. Store the image
    // (For the sake of simplicity, we'll assume you have a service function to handle this.)
    const imageUrl = await userService.storeUserProfileImage(imageFile, userId);

    // 5. Respond with relevant information
    return res.status(200).json({ success: true, message: "Image uploaded successfully", imageUrl });

  } catch (err) {
    console.log('uploadUserProfileImageError', err);
    next(err);
  }
};




