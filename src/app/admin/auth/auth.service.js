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

  try {
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
      id: user.id,
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

export const forgotPassword = async (reqBody, dbInstance) => {
  try {
      const { email, type ='admin' } = reqBody;
      const userModel = dbInstance.user;

      // Find user by email address
      const user = await userModel.findOne({ where: { email, user_type: type } });
      if (!user) {
          return { error: true, message: 'There is no user with this email address!'}
      }

      if (!user.status) {
          return { error: true, message: 'Account is disabled, contact admin!'}
      }

      // Update remember token in database
      user.rememberToken = utilsHelper.generateRandomString(32);
      user.rememberTokenExpire = new Date();
      await user.save();

      const emailData = [];
      emailData.name = user.fullName;
      emailData.forgotPasswordLink = `${utilsHelper.generateUrl(('admin-forgot-password'), user.userType)}`;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.ADMIN_FORGOT_PASSWORD), emailData);
      const payload = {
          to: email,
          subject: EMAIL_SUBJECT.ADMIN_FORGOT_PASSWORD,
          html: htmlData,
      }
      mailHelper.sendMail(payload);

      return true;
  } catch(err) {
      console.log('forgotPasswordServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
  }
}

export const updatePassword = async (reqBody, dbInstance) => {
  try {
      const { email, password, type ='admin' } = reqBody;
      const userModel = dbInstance.user;

      // Find user by email address
      const user = await userModel.findOne({ where: { email, user_type: type } });
      if (!user) {
          return { error: true, message: 'There is no user with this email address!'}
      }

      if (!user.status) {
          return { error: true, message: 'Account is disabled, contact admin!'}
      }
      // Update password against email address
      user.password = password
      await user.save();

      const emailData = [];
      emailData.email = user.email;
      emailData.name = user.fullName;
      emailData.loginLink = `${utilsHelper.generateUrl(('admin-update-password'), user.userType)}`;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.ADMIN_RESET_PASSWORD), emailData);
      const payload = {
          to: email,
          subject: EMAIL_SUBJECT.ADMIN_RESET_PASSWORD,
          html: htmlData,
      }
      mailHelper.sendMail(payload);

      return true;
  } catch(err) {
      console.log('forgotPasswordServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
  }
}

export const registerAsAdmin = async (reqBody, dbInstance) => {
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
            userType: USER_TYPE.ADMIN,
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

