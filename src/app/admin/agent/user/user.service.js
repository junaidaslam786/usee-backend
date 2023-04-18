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

export const listAgentUsers = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.user.findAndCountAll({
      where: { user_type: USER_TYPE.AGENT, status: true },
      include: [{
        model: dbInstance.agent,
      }],
      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listAgentUsersServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const listBlockedAgentUsers = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.user.findAndCountAll({
      where: { user_type: USER_TYPE.AGENT, status: false },
      include: [{
        model: dbInstance.agent,
      }],
      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listAgentUsersServiceError', err);
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
