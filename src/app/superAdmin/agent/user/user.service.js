import {
  USER_TYPE,
} from '@/config/constants';
import db from '@/database';
// import { where } from 'sequelize';

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

export const listAgents = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.user.findAndCountAll({
      where: { user_type: USER_TYPE.AGENT, status: true },
      include: [{
        model: dbInstance.agent,
        where: { agent_id: null },
      }],
      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('listAgentUsersServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const listAgentUsers = async (params, dbInstance) => {
  try {
    const { count, rows } = await dbInstance.user.findAndCountAll({
      where: { status: true },
      include: [{
        model: dbInstance.agent,
        where: { agent_id: params.id },
      }],
      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
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
    // eslint-disable-next-line no-console
    console.log('deleteAgentUserServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
