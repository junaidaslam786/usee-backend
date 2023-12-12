import { AGENT_TYPE, SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from '@/config/constants';

import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import { calculateDistance, calculateTime } from '@/helpers/googleMapHelper';

const { Op } = Sequelize;

const { user, userSubscriptions, agent, agentBranch, agentAvailability, product, productOffer, productLog, CustomerWishlist, customerLog, userAlert, productAllocation, agentAccessLevel, token, tokenTransaction, userSubscription, role, feature, subscriptionFeature } = db.models;

async function getSubAgentIds(userId) {
  try {
    const subAgents = await agent.findAll({
      where: { agentId: userId },
      attributes: ['id'],
    });

    const subAgentIds = subAgents.map(subAgent => subAgent.id);
    return subAgentIds;
  } catch (error) {
    console.error('Error retrieving sub-agent IDs:', error);
    throw error;
  }
}

export async function getUsersData(req, res, userInstance) {
  const { userCategories, startDate, endDate } = req.body;

  try {
    let userData = {};

    for (const userCategory of userCategories) {
      let categoryData;
      
      if (userCategory === 'agent') {
        let whereClause = {};

        if (userInstance.agent.agentType == AGENT_TYPE.AGENT) {
          whereClause.agentId = userInstance.id;
        } else {
          whereClause.managerId = userInstance.id;
        }
        // const where = userInstance.agent.agentType == AGENT_TYPE.AGENT ? { agentId: userInstance.id } : { managerId: userInstance.id };

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await agent.findAll({
          where: whereClause,
          include: [
            {
              model: user,
              include: [
                {
                  model: productAllocation,
                },
                {
                  model: agentAccessLevel,
                },
              ],
            },
          ],
          distinct: true,
          order: [["id", "DESC"]],
          // offset: limit * (page - 1),
          // limit: limit,
        });

        userData.agents = categoryData;
      }
    }

    return { userData };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesData(req, res, userInstance) {
  const { propertyCategories, startDate, endDate } = req.body;

  try {
    let propertyData = {};

    const where = {};
    let agentIds = await getSubAgentIds(userInstance.id)
    agentIds.push(req.user.id)

    for (const propertyCategory of propertyCategories) {
      let categoryData;

      if (propertyCategory === 'listed') {
        let whereClause = {};
        whereClause.userId = {
          [Op.in]: userInstance.agent.agentType == AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
        };

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          include: [
            {
              model: productOffer,
              attributes: ['id', 'amount', 'status', 'rejectReason'],
              include: [
                {
                  model: user,
                  as: 'customer',
                  attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
                },
              ],
            },
            {
              model: productLog,
              as: 'productViews',
              attributes: ['id', 'log_type', 'createdAt'],
              where: {
                log_type: 'viewed',
              },
            }
          ],
          distinct: true,
          order: [['createdAt', 'DESC']],
        });

        propertyData.listed = categoryData;
      }
      
      if (propertyCategory === 'sold') {
        let whereClause = {};
        whereClause.userId = {
          [Op.in]: userInstance.agent.agentType == AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
        };

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          include: [
            {
              model: productOffer,
              attributes: ['id', 'amount', 'status', 'rejectReason'],
              where: {
                status: 'accepted',
              },
              include: [
                {
                  model: user,
                  as: 'customer',
                  attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
                },
              ],
            },
            {
              model: productLog,
              as: 'productViews',
              attributes: ['id', 'log_type', 'createdAt'],
              where: {
                log_type: 'viewed',
              },
            }
          ],
          distinct: true,
          order: [['createdAt', 'DESC']],
        });

        propertyData.sold = categoryData;
      }
      
      if (propertyCategory === 'unsold') {
        let whereClause = {};
        whereClause.userId = {
          [Op.in]: userInstance.agent.agentType == AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
        };

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          include: [
            {
              model: productOffer,
              attributes: ['id', 'amount', 'status', 'rejectReason'],
              where: {
                status: {
                  [Op.in]: ['pending', 'rejected'],
                },
              },
              include: [
                {
                  model: user,
                  as: 'customer',
                  attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
                },
              ],
            },
            {
              model: productLog,
              as: 'productViews',
              attributes: ['id', 'log_type', 'createdAt'],
              where: {
                log_type: 'viewed',
              },
            }
          ],
          distinct: true,
          order: [['createdAt', 'DESC']],
        });

        propertyData.unsold = categoryData;
      }
    }

    return { propertyData };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Service error: getPropertiesData()', error });
  }
}

export async function getServicesData(req, res, userInstance) {
  const { serviceCategories, startDate, endDate } = req.body;

  try {
    let serviceData = {};

    for (const serviceCategory of serviceCategories) {
      let categoryData;

      if (serviceCategory === 'videoCall') {
        let whereClause = {};
        whereClause.featureId = '159c869a-1b24-4cd3-ac61-425645b730c7';

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await userSubscription.findAll({
          where: whereClause,
          // attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          order: [['createdAt', 'DESC']],
        });

        serviceData.videoCall = categoryData;
      }

      if (serviceCategory === 'propertyListing') {
        let whereClause = {};
        whereClause.featureId = '989d96e5-e839-4fe2-8f3e-bb6a5b2d30a2';

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await userSubscription.findAll({
          where: whereClause,
          // attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          order: [['createdAt', 'DESC']],
        });

        serviceData.propertyListing = categoryData;
      }
      
      if (serviceCategory === 'apiSubscription') {
        let whereClause = {};
        whereClause.featureId = '3ae5fd58-6cca-4e51-b368-1a3a310d99fc';

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await userSubscription.findAll({
          where: whereClause,
        });

        serviceData.apiSubscription = categoryData;
      }

      if (serviceCategory === 'analytics') {
        let whereClause = {};
        whereClause.featureId = '02d5274e-0739-4032-87fa-620211a31700';

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await userSubscription.findAll({
          where: whereClause,
        });

        serviceData.analytics = categoryData;
      }
    }

    return { serviceData };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Service error: getServicesData()', error });
  }
}

