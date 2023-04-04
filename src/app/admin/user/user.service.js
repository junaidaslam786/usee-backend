import {
  AGENT_TYPE, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, PROPERTY_ROOT_PATHS, USER_TYPE,
} from '@/config/constants';

import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import * as userService from '../../user/user.service';

const OP = Sequelize.Op;

export const listAgentUsers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.AGENT,
        status: true,
      },
      include: [
        {
          model: dbInstance.agent,
          as: 'agent',
        },
      ],

      order: [['id', 'DESC']],
    });
  } catch (err) {
    console.log('listAgentUsersToAllocateServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
export const listAdminUsers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.ADMIN,
        status: true,
      },


      order: [['id', 'DESC']],
    });
  } catch (err) {
    console.log('listAgentUsersToAllocateServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};


export const updateCurrentUser = async (reqBody, req) => {

  try {

    // const { user: userInfo } = req;

    // let user = userInfo;
    const user = await db.models.user.update(reqBody, {
      where: { id: reqBody.id },
    });
    console.log('user', user)
    const agent = await db.models.agent.update({
      companyName: reqBody.companyName,
      companyPosition: reqBody.companyPosition,
    },
    {
      where: { user_id: reqBody.id },
    });

    // if (reqBody?.firstName) {
    //     user.firstName = reqBody.firstName;
    // }

    // if (reqBody?.lastName) {
    //     user.lastName = reqBody.lastName;
    // }

    // if (reqBody?.phoneNumber) {
    //     user.phoneNumber = reqBody.phoneNumber;
    // }

    // if (reqBody?.city) {
    //     user.cityName = reqBody.city;
    // }

    // // profile image upload
    // if (req.files && req.files.profileImage) {
    //     const profileImageFile = req.files.profileImage;
    //     const newFileName = `${Date.now()}_${profileImageFile.name.replace(/ +/g, "")}`;
    //     const result = await utilsHelper.fileUpload(profileImageFile, PROPERTY_ROOT_PATHS.PROFILE_LOGO, newFileName);
    //     if (result?.error) {
    //         return { error: true, message: result?.error }
    //     }

    //     user.profileImage = result;
    // }

    // if (reqBody?.companyPosition || reqBody?.mobileNumber || reqBody?.companyName || reqBody?.companyAddress || reqBody?.zipCode || reqBody?.mortgageAdvisorEmail || req?.files?.companyLogo) {
    //     let agent = user.agent;

    //     if (reqBody?.companyPosition) {
    //         agent.companyPosition = reqBody.companyPosition;
    //     }

    //     if (reqBody?.mobileNumber) {
    //         agent.mobileNumber = reqBody.mobileNumber;
    //     }

    //     if (reqBody?.companyName) {
    //         agent.companyName = reqBody.companyName;
    //     }

    //     if (reqBody?.companyAddress) {
    //         agent.companyAddress = reqBody.companyAddress;
    //     }

    //     if (reqBody?.zipCode) {
    //         agent.zipCode = reqBody.zipCode;
    //     }

    //     if (reqBody?.mortgageAdvisorEmail) {
    //         agent.mortgageAdvisorEmail = reqBody.mortgageAdvisorEmail;
    //     }

    //     // company logo upload
    //     if (req.files && req.files.companyLogo) {
    //         const companyLogoFile = req.files.companyLogo;
    //         const newFileName = `${Date.now()}_${companyLogoFile.name.replace(/ +/g, "")}`;
    //         const result = await utilsHelper.fileUpload(companyLogoFile, PROPERTY_ROOT_PATHS.PROFILE_LOGO, newFileName);
    //         if (result?.error) {
    //             return { error: true, message: result?.error }
    //         }

    //         agent.companyLogo = result;
    //     }

    //     await agent.save();
    // }

    // await user.save();

    return true;
  } catch (err) {
    console.log('updateCurrentUserServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const updatePassword = async (user, reqBody) => {
  try {
    const { current, password } = reqBody;

    // Check user password
    const isValidPassword = await user.validatePassword(current);
    if (!isValidPassword) {
      return { error: true, message: 'Current password is incorrect!' };
    }

    // Update password
    user.password = password;
    await user.save();

    return true;
  } catch (err) {
    console.log('updatePasswordServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createUserWithPassword = async (userData, transaction) => {
  try {
    return transaction ? await db.models.user.create(userData, { transaction }) : await db.models.user.create(userData);
  } catch (err) {
    console.log('createUserWithPasswordServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const getUserById = async (id) => await db.models.user.findOne({ where: { id } });

export const getUserByEmail = async (email) => await db.models.user.findOne({ where: { email } });

export const listCustomerUsers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.CUSTOMER,
        status: true,
      },

      order: [['id', 'DESC']],
    });
  } catch (err) {
    console.log('listAgentUsersToAllocateServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const totalCustomers = async (dbInstance) => {
  try {
    return await dbInstance.user.findAll({
      where: {
        userType: USER_TYPE.CUSTOMER,
      },
      order: [['id', 'DESC']],
    });
  } catch (err) {
    console.log('listAgentUsersToAllocateServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const deleteCustomer = async (appointmentId, req) => {
  try {
    const { user, dbInstance } = req;
    const appointment = await getUserById(appointmentId);
    if (!appointment) {
      return { error: true, message: 'Invalid customer id or customer do not exist.' };
    }

    await dbInstance.user.destroy({
      where: {
        id: appointmentId,
      },
    });

    return true;
  } catch (err) {
    console.log('deleteAppointmentServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
