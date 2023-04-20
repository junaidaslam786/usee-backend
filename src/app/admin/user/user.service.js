import {
  AGENT_TYPE, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, PROPERTY_ROOT_PATHS, USER_TYPE,
} from '@/config/constants';

import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import * as userService from '../../user/user.service';

const OP = Sequelize.Op;

export const updateCurrentUser = async (reqBody, req) => {

  try {
    const user = await db.models.user.update(reqBody, {
      where: { id: reqBody.id },
    });

    const agent = await db.models.agent.update({
      companyName: reqBody.companyName,
      companyPosition: reqBody.companyPosition,
    },
    {
      where: { user_id: reqBody.id },
    });

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
    console.log('listCustomerUsersServiceError', err);
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
    console.log('totalCustomerServiceError', err);
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
    console.log('deleteCustomerServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
