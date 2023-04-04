/* eslint-disable max-len */
/* eslint-disable eqeqeq */
/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Sequelize } from 'sequelize';
import db from '@/database';
import {
  USER_TYPE, AGENT_TYPE, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH,
} from '@/config/constants';
import { mailHelper, utilsHelper } from '@/helpers';
import * as userService from '../user/user.service';

const OP = Sequelize.Op;

const path = require('path');
const ejs = require('ejs');

export const login = async (reqBody, dbInstance) => {
  console.log('in Login')

  try {
    console.log('in Login Try')
    const { email, password, type } = reqBody;
    const userType = USER_TYPE.ADMIN;

    // Find user by email address
    const user = await dbInstance.user.findOne({
      include: [
        {
          attributes: ['id', 'name'],
          model: dbInstance.role,
          as: 'role',
          include: [{
            model: dbInstance.permission,
            attributes: ['id', 'name', 'key'],
            through: { attributes: [] },
          }],
        },
      ],
      where: { email, userType },
    });
    if (!user) {
      return { error: true, message: 'There is no user with this email address!' };
    }

    if (!user.status) {
      return { error: true, message: 'Account is disabled, please contact admin!' };
    }

    // Check user password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return { error: true, message: 'Incorrect password!' };
    }

    // Generate and return token
    const token = user.generateToken();
    const refreshToken = user.generateToken('4h');

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      type: user.userTypeDisplay,
      profileImage: user.profileImage,
      city: user.city ? user.city.name : '',
      role: user.role ? {
        name: user.role.name,
        permissions: user.role.permissions,
      } : null,
    };
    return { user: userData, token, refreshToken };
  } catch (err) {
    console.log('loginServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const registerAsAdmin = async (reqBody, dbInstance) => {
  try {
    const { agent: agentTable, agentTimeSlot, agentAvailability } = dbInstance;
    const {
      firstName, lastName, email, password, companyName, companyPosition,
    } = reqBody;
    console.log(reqBody)


    const result = await db.transaction(async (transaction) => {
      // Create user
      const user = await userService.createUserWithPassword({
        firstName,
        lastName,
        email,
        password,
        phoneNumber: reqBody.phoneNumber,
        status: 1,
        userType: USER_TYPE.ADMIN,
      }, transaction);

      // create agent profile
      const agent = await agentTable.create({
        userId: user.id,
        companyName,
        companyPosition,
        agentType: AGENT_TYPE.AGENT,
        apiCode: utilsHelper.generateRandomString(10, true),
      }, { transaction });

      const timeslots = await agentTimeSlot.findAll();
      for (let day = 1; day <= 7; day++) {
        const agentAvailabilities = [];
        for (const slot of timeslots) {
          agentAvailabilities.push({
            userId: user.id,
            dayId: day,
            timeSlotId: slot.id,
            status: true,
          });
        }
        await agentAvailability.bulkCreate(agentAvailabilities, { transaction });
      }

      // Generate and return tokens
      const token = user.generateToken();
      const refreshToken = user.generateToken('4h');

      const returnedUserData = {
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: agent.companyName,
        companyPosition: agent.companyPosition,
        phoneNumber: user.phoneNumber,
        email: user.email,
        type: user.userTypeDisplay,
      };

      const emailData = [];
      emailData.name = user.firstName + user.lastName;
      emailData.type = user.type;
      emailData.tempPass = reqBody.password;
      emailData.login = utilsHelper.generateUrl('admin-login', user.userType);
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.ADMIN_REGISTER_TEMP_PASSWORD), emailData);
      const payload = {
        to: user.email,
        subject: EMAIL_SUBJECT.ADMIN_REGISTER_AGENT,
        html: htmlData,
      };
      mailHelper.sendMail(payload);

      return { user: returnedUserData, token, refreshToken };
    });
    return result;
  } catch (err) {
    console.log('registerAsAdminError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const registerAsAgent = async (reqBody, dbInstance) => {
  console.log('reqBody', reqBody)
  try {
    const { agent: agentTable, agentTimeSlot, agentAvailability } = dbInstance;
    const { firstName, lastName, email, password, companyName, companyPosition, phoneNumber, jobTitle } = reqBody;
    
    const result = await db.transaction(async (transaction) => {
        // Create user
        const user = await userService.createUserWithPassword({
            firstName, 
            lastName, 
            email, 
            password,
            phoneNumber,
            status: 1, 
            userType: USER_TYPE.AGENT,
        }, transaction);
        console.log('user', user)

        // create agent profile
        const agent = await agentTable.create({
            userId: user.id,
            companyName, 
            companyPosition,
            jobTitle,
            licenseNo: reqBody?.licenseNo ? reqBody.licenseNo : "",
            agentType: AGENT_TYPE.AGENT, 
            apiCode: utilsHelper.generateRandomString(10, true),
        }, { transaction });
        console.log('agent', agent)

        const timeslots = await agentTimeSlot.findAll();
        for (let day = 1; day <= 7; day++) {
            let agentAvailabilities = [];
            for (const slot of timeslots) {
                agentAvailabilities.push({
                    userId: user.id,
                    dayId: day,
                    timeSlotId: slot.id,
                    status: true,
                });
            }
            await agentAvailability.bulkCreate(agentAvailabilities, { transaction });
        }

        // Generate and return tokens
        const token = user.generateToken();
        const refreshToken = user.generateToken('4h');

        const returnedUserData = {
            firstName: user.firstName,
            lastName: user.lastName,
            companyName: agent.companyName,
            companyPosition: agent.companyPosition,
            phoneNumber: user.phoneNumber,
            email: user.email,
            type: user.userTypeDisplay,
        };

        const emailData = [];
        emailData.name = user.fullName;
        emailData.type = user.userType;
        emailData.tempPass = reqBody.password;
        emailData.login = utilsHelper.generateUrl('agent-login', user.userType);
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.ADMIN_REGISTER_TEMP_PASSWORD), emailData);
        const payload = {
            to: user.email,
            subject: EMAIL_SUBJECT.ADMIN_REGISTER_AGENT,
            html: htmlData,
            body: `Please login through ${user.email, user.password}`
        }
        mailHelper.sendMail(payload);

        return { user: returnedUserData, token, refreshToken };
    });
   return result;
} catch(err) {
    console.log('registerAsAgentError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
}
};

export const registerAsCustomer = async (reqBody, dbInstance) => {
  try {
    const { user: userTable } = dbInstance;
    const {
      firstName, lastName, email, password, phoneNumber,
    } = reqBody;

    console.log(reqBody);
    // Create user
    const userData = {
      firstName,
      lastName,
      email,
      password,
      status: 1,
      phoneNumber,
      userType: USER_TYPE.CUSTOMER,
    };
    const user = await userTable.create(userData);

    // Generate and return tokens
    const token = user.generateToken();
    const refreshToken = user.generateToken('4h');

    const returnedUserData = {
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      type: user.userTypeDisplay,
    };

    const emailData = [];
    emailData.name = user.fullName;
    emailData.type = user.userType;
    emailData.tempPass = reqBody.password;
    emailData.login = utilsHelper.generateUrl('customer-login', user.userType);
    const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.ADMIN_REGISTER_TEMP_PASSWORD), emailData);
    const payload = {
      to: user.email,
      subject: EMAIL_SUBJECT.ADMIN_REGISTER_CUSTOMER,
      html: htmlData,
    };
    mailHelper.sendMail(payload);

    return { user: returnedUserData, token, refreshToken };
  } catch (err) {
    console.log('registerAsCustomerError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const forgotPassword = async (reqBody, dbInstance) => {
  try {
    const { email, type } = reqBody;
    const userModel = dbInstance.user;

    // Find user by email address
    const user = await userModel.findOne({ where: { email } });
    if (!user) {
      return { error: true, message: 'There is no user with this email address!' };
    }

    if (!user.status) {
      return { error: true, message: 'Account is disabled, contact admin!' };
    }

    // Update remember token in database
    user.rememberToken = utilsHelper.generateRandomString(32);
    user.rememberTokenExpire = new Date();
    await user.save();

    const emailData = [];
    emailData.name = user.fullName;
    emailData.resetPasswordLink = `${utilsHelper.generateUrl((type == 'agent' ? 'agent-reset-password' : 'customer-reset-password'), user.userType)}/${user.rememberToken}`;
    const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.FORGOT_PASSWORD), emailData);
    const payload = {
      to: email,
      subject: EMAIL_SUBJECT.FORGOT_PASSWORD,
      html: htmlData,
    };
    mailHelper.sendMail(payload);

    return true;
  } catch (err) {
    console.log('forgotPasswordServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const resetPassword = async (reqBody, dbInstance) => {
  try {
    const { token, password, type } = reqBody;
    const userModel = dbInstance.user;

    // Find user by email address
    const user = await userModel.findOne({
      where: {
        rememberToken: token,
        rememberTokenExpire: {
          [OP.lt]: new Date(),
          [OP.gt]: new Date(new Date() - 1 * 60 * 60 * 1000), // 1 hour
        },
      },
    });

    if (!user) {
      return { error: true, message: 'Password reset token is invalid or has expired' };
    }

    // Update password
    user.rememberToken = null;
    user.rememberTokenExpire = null;
    user.password = password;
    await user.save();

    const emailData = [];
    emailData.name = user.fullName;
    emailData.email = user.email;
    emailData.login = utilsHelper.generateUrl((type == 'agent' ? 'agent-login' : 'customer-login'), user.userType);
    const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.RESET_PASSWORD), emailData);
    const payload = {
      to: email,
      subject: EMAIL_SUBJECT.RESET_PASSWORD,
      html: htmlData,
    };
    mailHelper.sendMail(payload);

    return true;
  } catch (err) {
    console.log('resetPasswordServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};