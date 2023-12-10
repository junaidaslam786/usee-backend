import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from '@/config/constants';

import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import { calculateDistance, calculateTime } from '@/helpers/googleMapHelper';

const { Op } = Sequelize;

const { user, userSubscription, agent, agentBranch, agentAvailability, product, productOffer, productLog, CustomerWishlist, CustomerLog, UserAlert, ProductAllocation, agentAccessLevel, UserCallBackgroundImage, token, tokenTransaction, UserSubscription, role, feature, subscriptionFeature } = db.models;

export async function getUsersData(req, res) {
  const { userCategories, startDate, endDate } = req.body;

  try {
    let userData = {};

    for (const userCategory of userCategories) {
      let categoryData;

      if (userCategory === 'admin') {
        let whereClause = {};
        whereClause.userType = 'admin';

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await user.findAll({
          where: whereClause,
        });

        userData.admins = categoryData;
      }
      
      if (userCategory === 'agent') {
        let whereClause = {};
        whereClause.userType = 'agent';

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await user.findAll({
          where: whereClause,
        });

        userData.agents = categoryData;
      }
      
      if (userCategory === 'customer') {
        let whereClause = {};
        whereClause.userType = 'customer';

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await user.findAll({
          where: whereClause,
        });

        userData.customers = categoryData;
      }
    }

    return { userData };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesData(req, res) {
  const { propertyCategories, startDate, endDate } = req.body;

  try {
    let propertyData = {};

    for (const propertyCategory of propertyCategories) {
      let categoryData;

      if (propertyCategory === 'listed') {
        let whereClause = {};

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          order: [['createdAt', 'DESC']],
        });

        propertyData.listed = categoryData;
      }
      
      if (propertyCategory === 'sold') {
        let whereClause = {};

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
          ],
          order: [['createdAt', 'DESC']],
        });

        propertyData.sold = categoryData;
      }
      
      if (propertyCategory === 'unsold') {
        let whereClause = {};

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
          ],
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

export async function getServicesData(req, res) {
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

