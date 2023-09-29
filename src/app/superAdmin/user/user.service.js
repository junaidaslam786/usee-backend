import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";

const OP = Sequelize.Op;

export const updateCurrentUser = async (reqBody, req) => {
  try {
    const user = await db.models.user.findOne({
      where: { id: reqBody.id },
    });

    // Update only provided fields
    if (reqBody.firstName) user.firstName = reqBody.firstName;
    if (reqBody.lastName) user.lastName = reqBody.lastName;
    if (reqBody.phoneNumber) user.phoneNumber = reqBody.phoneNumber;
    if (reqBody.email) user.email = reqBody.email;
    if (reqBody.status) user.status = reqBody.status;
    if (reqBody.active) user.active = reqBody.active;
    if (reqBody.cityName) user.cityName = reqBody.cityName;
    if (reqBody.timezone) user.timezone = reqBody.timezone;
    await user.save();

    // feature image upload
    if (req.files && req.files.image) {
      const featuredImageFile = req.files.image;
      const removeImg = utilsHelper.removeFile(user.profileImage);
      const newImageName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
      const result = await utilsHelper.fileUpload(
        featuredImageFile,
        SUPERADMIN_PROFILE_PATHS.PROFILE_IMAGE,
        newImageName
      );
      if (result?.error) {
        return { error: true, message: result?.error };
      }
      user.profileImage = result;
      await user.save();
    }

    let url;
    if (req.files && req.files.file) {
      const doc = req.files.file;
      const documentName = `${Date.now()}_${doc.name.replace(/ +/g, "")}`;
      utilsHelper.removeFile(user.documentUrl);
      const docUrl = await utilsHelper.fileUpload(doc, PROPERTY_ROOT_PATHS.PROFILE_DOCUMENT, documentName);
      if (docUrl?.error) {
        return { error: true, message: docUrl?.error };
      }
      url = docUrl;

      // Update the user.documentUrl
      await db.models.agent.update({ documentUrl: url }, { where: { userId: reqBody.id } });
    }

    const agent = await db.models.agent.update(
      {
        companyName: reqBody.companyName,
        companyPosition: reqBody.companyPosition,
        jobTitle: reqBody.jobTitle,
      },
      {
        where: { user_id: reqBody.id },
      }
    );
    return { user };
  } catch (err) {
    console.log("updateCurrentUserServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updateUserById = async (reqBody, req) => {
  try {
    const user = await db.models.user.findOne({
      where: { id: reqBody.id },
    });

    // Update only provided fields
    if (reqBody.firstName) user.firstName = reqBody.firstName;
    if (reqBody.lastName) user.lastName = reqBody.lastName;
    if (reqBody.phoneNumber) user.phoneNumber = reqBody.phoneNumber;
    if (reqBody.email) user.email = reqBody.email;
    if (reqBody.status) user.status = reqBody.status;
    if (reqBody.active) user.active = reqBody.active;
    if (reqBody.cityName) user.cityName = reqBody.cityName;
    if (reqBody.timezone) user.timezone = reqBody.timezone;
    await user.save();

    // feature image upload
    if (req.files && req.files.image) {
      const featuredImageFile = req.files.image;
      const removeImg = utilsHelper.removeFile(user.profileImage);
      const newImageName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
      const result = await utilsHelper.fileUpload(
        featuredImageFile,
        SUPERADMIN_PROFILE_PATHS.PROFILE_IMAGE,
        newImageName
      );
      if (result?.error) {
        return { error: true, message: result?.error };
      }
      user.profileImage = result;
      await user.save();
    }

    let url;
    if (req.files && req.files.file) {
      const doc = req.files.file;
      const documentName = `${Date.now()}_${doc.name.replace(/ +/g, "")}`;
      utilsHelper.removeFile(user.documentUrl);
      const docUrl = await utilsHelper.fileUpload(doc, PROPERTY_ROOT_PATHS.PROFILE_DOCUMENT, documentName);
      if (docUrl?.error) {
        return { error: true, message: docUrl?.error };
      }
      url = docUrl;

      // Update the user.documentUrl
      await db.models.agent.update({ documentUrl: url }, { where: { userId: reqBody.id } });
    }

    const agent = await db.models.agent.update(
      {
        companyName: reqBody.companyName,
        companyPosition: reqBody.companyPosition,
        jobTitle: reqBody.jobTitle,
      },
      {
        where: { user_id: reqBody.id },
      }
    );
    return { user };
  } catch (err) {
    console.log("updateUserByIdServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updatePassword = async (user, reqBody) => {
  try {
    const { current, password } = reqBody;

    // Check user password
    const isValidPassword = await user.validatePassword(current);
    if (!isValidPassword) {
      return { error: true, message: "Current password is incorrect!" };
    }

    // Update password
    user.password = password;
    await user.save();

    return true;
  } catch (err) {
    console.log("updatePasswordServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const createUserWithPassword = async (userData, transaction) => {
  try {
    return transaction ? await db.models.user.create(userData, { transaction }) : await db.models.user.create(userData);
  } catch (err) {
    console.log("createUserWithPasswordServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const activateUserById = async (reqBody, req) => {
  try {
    console.log("|||----|||");
    console.log(reqBody);
    console.log("|||----|||");
    // Fetch the user from the database
    const user = await db.models.user.findOne({
      where: { id: reqBody.id },
    });

    if (!user) {
      return { error: true, message: "User not found." };
    }

    // Update the user active status
    user.active = reqBody.active || true;
    await user.save();

    return { user };
  } catch (err) {
    console.log("activateUserByIdServiceError", err.message);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deactivateUserById = async (reqBody, req) => {
  try {
    // Fetch the user from the database
    const user = await db.models.user.findOne({
      where: { id: reqBody.id },
    });

    if (!user) {
      return { error: true, message: "User not found." };
    }

    // Update the user active status
    user.active = reqBody.active || false;
    await user.save();

    return { user };
  } catch (err) {
    console.log("deactivateUserByIdServiceError", err.message);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getUserById = async (id) => await db.models.user.findOne({ where: { id } });

export const getUserByEmail = async (email) => await db.models.user.findOne({ where: { email } });

export const listAdminUsers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.ADMIN,
      },

      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log("listCustomerUsersServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const listUsersExceptSuperAdmin = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: {
          [OP.not]: USER_TYPE.SUPERADMIN
        }
      },

      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log("listCustomerUsersServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const listCustomerUsers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.CUSTOMER,
        status: true,
      },

      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log("listCustomerUsersServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const totalCustomers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.CUSTOMER,
      },
      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log("totalCustomerServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deleteCustomer = async (appointmentId, req) => {
  try {
    const { user, dbInstance } = req;
    const appointment = await getUserById(appointmentId);
    if (!appointment) {
      return { error: true, message: "Invalid customer id or customer do not exist." };
    }

    await dbInstance.user.destroy({
      where: {
        id: appointmentId,
      },
    });

    return true;
  } catch (err) {
    console.log("deleteCustomerServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deleteUser = async (req) => {
  try {
    const { id } = req.params;
    const appointment = await getUserById(id);
    if (!appointment) {
      return { error: true, message: "Invalid user id or user does not exist." };
    }

    await req.dbInstance.user.destroy({
      where: {
        id: id,
      },
    });

    return true;
  } catch (err) {
    console.log("deleteUserServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getSuperAdminDetails = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.SUPERADMIN,
      },
      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log("getSuperAdminDetailsServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updateSuperAdminDetails = async (reqBody, req) => {
  try {
    // Fetch the superadmin user from the database
    const superAdmin = await db.models.user.findOne({
      where: { id: reqBody.id, userType: USER_TYPE.SUPERADMIN },
    });

    if (!superAdmin) {
      return { error: true, message: "Superadmin not found." };
    }

    // Update the superadmin details
    superAdmin.firstName = reqBody.firstName;
    superAdmin.lastName = reqBody.lastName;
    superAdmin.email = reqBody.email;
    superAdmin.phoneNumber = reqBody.phoneNumber;
    await superAdmin.save();

    // Handle image upload if provided
    if (req.files && req.files.image) {
      const featuredImageFile = req.files.image;
      const removeImg = utilsHelper.removeFile(superAdmin.profileImage);
      const newImageName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
      const result = await utilsHelper.fileUpload(
        featuredImageFile,
        SUPERADMIN_PROFILE_PATHS.PROFILE_IMAGE,
        newImageName
      );

      if (result?.error) {
        return { error: true, message: result?.error };
      }

      superAdmin.profileImage = result;
      await superAdmin.save();
    }

    return { superAdmin };
  } catch (err) {
    console.log("updateSuperAdminDetailsServiceError", err.message);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const storeUserProfileImage = async (imageFile, userId) => {
  try {
    // Check if the image is provided
    if (!imageFile) {
      return { error: true, message: "Image file is required" };
    }

    // Remove the existing image (if any)
    const user = await db.models.user.findOne({ where: { id: userId } });
    if (user && user.profileImage) {
      utilsHelper.removeFile(user.profileImage);
    }

    // Upload the new image
    const newImageName = `${Date.now()}_${imageFile.name.replace(/ +/g, "")}`;
    const result = await utilsHelper.fileUpload(imageFile, SUPERADMIN_PROFILE_PATHS.PROFILE_IMAGE, newImageName);

    if (result?.error) {
      return { error: true, message: result?.error };
    }

    // Update the user's profileImage in the database
    user.profileImage = result;
    await user.save();

    return { success: true, imageUrl: result };
  } catch (err) {
    console.log("storeUserProfileImageError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};
