import {
  AGENT_TYPE, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, USER_TYPE,
} from '@/config/constants';
import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import * as userService from '../../user/user.service';

const path = require('path');
const ejs = require('ejs');

const OP = Sequelize.Op;

export const listAgentUsers = async (reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    const { count, rows } = await dbInstance.user.findAndCountAll({
      where: { status: true, user_type: USER_TYPE.AGENT },
      include: [{
        model: dbInstance.agent,
      }],
      order: [['id', 'DESC']],
      offset: (itemPerPage * (page - 1)),
      limit: itemPerPage,
    });

    return {
      data: rows,
      page,
      size: itemPerPage,
      totalPage: Math.ceil(count / itemPerPage),
      totalItems: count,
    };
  } catch (err) {
    console.log('listAgentUsersServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const listBlockedAgentUsers = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    const { count, rows } = await dbInstance.user.findAndCountAll({
      where: { user_type: USER_TYPE.AGENT, status: false },
      include: [{
        model: dbInstance.agent,
      }],
      order: [['id', 'DESC']],
      offset: (itemPerPage * (page - 1)),
      limit: itemPerPage,
    });

    return {
      data: rows,
      page,
      size: itemPerPage,
      totalPage: Math.ceil(count / itemPerPage),
      totalItems: count,
    };
  } catch (err) {
    console.log('listAgentUsersServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const listAgentUsersToAllocate = async (agentInfo, dbInstance) => {
  try {
    const whereClause = agentInfo.agent.agentType == AGENT_TYPE.AGENT ? { agentId: agentInfo.id } : { managerId: agentInfo.id };
    return await dbInstance.agent.findAll({
      where: whereClause,
      attributes: ['userId'],
      include: [{
        model: dbInstance.user,
        attributes: ['firstName', 'lastName'],
      }],
      order: [['id', 'DESC']],
    });
  } catch (err) {
    console.log('listAgentUsersToAllocateServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createAgentUsers = async (reqBody, req) => {
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
        emailData.login = utilsHelper.generateUrl('agent-login', user.userType);
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_AGENT), emailData);
        const payload = {
            to: user.email,
            subject: EMAIL_SUBJECT.REGISTER_AGENT,
            html: htmlData,
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

export const updateAgentUserBranch = async (reqBody, req) => {
  try {
    const { userId, branchId } = reqBody;
    const { user, dbInstance } = req;

    await db.transaction(async (transaction) => {
      const agent = await getAgentUserByUserId(userId, dbInstance);

      agent.branchId = branchId;
      agent.updatedBy = user.id;

      await agent.save({ transaction });
    });

    return true;
  } catch (err) {
    console.log('updateAgentUserBranchServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const updateAgentUserSorting = async (reqBody, req) => {
  try {
    const { userId, sort } = reqBody;
    const { user, dbInstance } = req;

    await db.transaction(async (transaction) => {
      const agent = await getAgentUserByUserId(userId, dbInstance);

      agent.sortOrder = sort;
      agent.updatedBy = user.id;

      await agent.save({ transaction });
    });

    return true;
  } catch (err) {
    console.log('updateAgentUserSortingServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const updateAgentUserStatus = async (reqBody, req) => {
  try {
    const { userId, updateStatus } = reqBody;
    const { dbInstance } = req;

    const user = await getAgentUserByUserId(userId, dbInstance);

    user.status = updateStatus;
    user.updatedBy = userId;

    await user.save();

    return true;
  } catch (err) {
    console.log('updateAgentUserSortingServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const checkAvailability = async (reqBody, req) => {
  try {
    const { userId, date, time } = reqBody;
    const dayId = new Date(date);

    const result = await req.dbInstance.agentAvailability.findOne({
      where: {
        userId,
        dayId: dayId.getDay() + 1,
        status: true,
      },
      include: [{
        model: req.dbInstance.agentTimeSlot,
        where: {
          [OP.and]: [
            { fromTime: { [OP.lte]: time } },
            { toTime: { [OP.gt]: time } },
          ],
        },
      }],
    });
    return !!result;
  } catch (err) {
    console.log('checkAvailabilityServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const getAgentUser = async (agentUserId, dbInstance) => {

  try {
    const agentUser = await getAgentUserDetailByUserId(agentUserId, dbInstance);
    if (!agentUser) {
      return { error: true, message: 'Invalid user id or user do not exist.' };
    }

    return agentUser;
  } catch (err) {
    console.log('getAgentUserServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const deleteAgentUser = async (userId, dbInstance) => {
  try {
    const agentUser = await getAgentUserByUserId(userId, dbInstance);
    if (!agentUser) {
      return { error: true, message: 'Invalid user id or user do not exist.' };
    }

    await db.transaction(async (transaction) => {
      await dbInstance.agent.destroy({
        where: {
          userId,
        },
      }, { transaction });

      await dbInstance.user.destroy({
        where: {
          id: userId,
        },
      }, { transaction });
    });

    return true;
  } catch (err) {
    console.log('deleteAgentUserServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

const getAgentUserByUserId = async (agentUserId, dbInstance) => {

  const agentUser = await dbInstance.user.findOne({ where: { id: agentUserId } });

  if (!agentUser) {
    return false;
  }

  return agentUser;
};

const getAgentUserDetailByUserId = async (agentUserId, dbInstance) => {

  const agentUser = await dbInstance.agent.findOne({
    
    where: { userId: agentUserId },
    include: [
      {
        model: dbInstance.user,
        include: [{
          model: dbInstance.productAllocation,
          include: [{
            model: dbInstance.product,
            attributes: ['id'],
          }],
        }],
      },
      {
        model: dbInstance.user,
      }],
  });

  if (!agentUser) {
    return false;
  }

  return agentUser;
};
