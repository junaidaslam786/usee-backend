import {
  AGENT_TYPE,
  APPOINTMENT_LOG_TYPE,
  // SUPERADMIN_PROFILE_PATHS,
  // PROPERTY_ROOT_PATHS,
  // USER_TYPE
} from '@/config/constants';

// import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import * as userService from '../user/user.service';
import { getCarbonFootprint } from '../analytics/analytics.service';
// import appointmentProducts from '@/database/models/appointment-products';
// import appointment from '@/database/models/appointment';

// import { calculateDistance, calculateTime } from '@/helpers/googleMapHelper';

const { Op } = Sequelize;

const {
  appointment, appointmentLog, agent, feature, product, productLog, productOffer, productSnagList, productSnagListItem, productAllocation, agentAccessLevel, tokenTransaction, user, userSubscription,
} = db.models;

function toCapitalCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, str => str.toUpperCase());
}

async function getSubAgentIds(userId) {
  try {
    const subAgents = await agent.findAll({
      where: { agentId: userId },
      attributes: ['userId'],
    });

    const subAgentIds = subAgents.map((subAgent) => subAgent.userId);
    return subAgentIds;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error retrieving sub-agent IDs:', error);
    throw error;
  }
}

export async function getUsersData(req, res, userInstance) {
  const { userCategories, startDate, endDate } = req.body;

  try {
    // eslint-disable-next-line prefer-const
    let userData = {};

    // eslint-disable-next-line no-restricted-syntax
    for (const userCategory of userCategories) {
      let categoryData;

      if (userCategory === 'agent') {
        const whereClause = {
          [userInstance.agent.agentType === AGENT_TYPE.AGENT ? 'agentId' : 'managerId']: userInstance.id,
        };

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        // eslint-disable-next-line no-await-in-loop
        const subAgentsData = await userService.listAgentUsersReportData(req.user, {}, req.dbInstance);
        userData = subAgentsData;

        // userData.agents = categoryData;
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
    let agentIds = await getSubAgentIds(userInstance.id);
    agentIds.push(req.user.id);

    // eslint-disable-next-line no-restricted-syntax
    for (const propertyCategory of propertyCategories) {
      let categoryData;

      if (propertyCategory === 'listed') {
        let whereClause = {
          status: 'active',
        };
        whereClause.userId = {
          [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
        };

        if (startDate && endDate) {
          whereClause.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        // // eslint-disable-next-line no-await-in-loop
        // const propertiesData = await userService.listAgentPropertiesReportData(req.user, {}, req.dbInstance);
        // propertyData = subAgentsData;

        // eslint-disable-next-line no-await-in-loop
        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status', 'createdAt', 'updatedAt',
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
              )
            `), 'total_calls'],
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "appointment_logs" AS al
                      WHERE al."appointment_id" = a."id"
                      AND al."user_id" = product.user_id
                      AND al."log_type" = '${APPOINTMENT_LOG_TYPE.JOINED}'
                  )
              )
            `), 'missed_calls'],
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
                  AND a."status" IN ('pending', 'scheduled')
              )
            `), 'upcoming_appointments'],
            // [Sequelize.literal(`
            //     (
            //         SELECT JSON_OBJECT_AGG(COALESCE(a."co2_details", '{}'), a."id")
            //         FROM "appointments" AS a
            //         JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
            //         WHERE ap."product_id" = product.id
            //         AND a."status" IN ('completed')
            //     )
            // `), 'co2DetailsSummary'],
          ],
          include: [
            {
              model: productOffer,
              attributes: ['id', 'amount', 'status', 'rejectReason', 'acceptedAt'],
              include: [
                {
                  model: productSnagList,
                  include: [
                    {
                      model: productSnagListItem,
                    },
                  ],
                }, {
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
            },
            {
              model: productAllocation,
              attributes: [],
              include: [
                {
                  model: user,
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
            {
              model: appointment,
              attributes: ['id', 'appointmentDate', 'status', 'startMeetingTime', 'endMeetingTime', 'appointmentTimeGmt', 'co2Details'],
              include: [
                {
                  model: user,
                  as: 'customerUser',
                  attributes: ['firstName', 'lastName'],
                },
                {
                  model: user,
                  as: 'allotedAgentUser',
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
          ],
          distinct: true,
          order: [['createdAt', 'DESC']],
        });

        propertyData.listed = categoryData;
      }

      if (propertyCategory === 'sold') {
        let whereClause = {
          status: propertyCategory,
        };
        whereClause.userId = {
          [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
        };

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        // eslint-disable-next-line no-await-in-loop
        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status', 'createdAt', 'updatedAt',
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
              )
            `), 'total_calls'],
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "appointment_logs" AS al
                      WHERE al."appointment_id" = a."id"
                      AND al."user_id" = product.user_id
                      AND al."log_type" = '${APPOINTMENT_LOG_TYPE.JOINED}'
                  )
              )
            `), 'missed_calls'],
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
                  AND a."status" IN ('pending', 'scheduled')
              )
            `), 'upcoming_appointments'],
            // [Sequelize.literal(`
            //     (
            //         SELECT JSON_OBJECT_AGG(COALESCE(a."co2_details", '{}'), a."id")
            //         FROM "appointments" AS a
            //         JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
            //         WHERE ap."product_id" = product.id
            //         AND a."status" IN ('completed')
            //     )
            // `), 'co2DetailsSummary'],
          ],
          include: [
            {
              model: req.dbInstance.productMetaTag,
              attributes: ['value'],
              include: [
                {
                  model: req.dbInstance.categoryField,
                  attributes: ['id', 'label', 'type', 'options', 'required'],
                },
              ],
            },
            {
              model: productOffer,
              attributes: ['id', 'amount', 'status', 'rejectReason', 'acceptedAt'],
              // where: {
              //   status: 'accepted',
              // },
              include: [
                {
                  model: productSnagList,
                  include: [
                    {
                      model: productSnagListItem,
                    },
                  ],
                }, {
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
            },
            {
              model: productAllocation,
              attributes: [],
              include: [
                {
                  model: user,
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
            {
              model: appointment,
              attributes: ['id', 'appointmentDate', 'status', 'startMeetingTime', 'endMeetingTime', 'appointmentTimeGmt', 'co2Details'],
              include: [
                {
                  model: user,
                  as: 'customerUser',
                  attributes: ['firstName', 'lastName'],
                },
                {
                  model: user,
                  as: 'allotedAgentUser',
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
          ],
          distinct: true,
          order: [['createdAt', 'DESC']],
        });

        propertyData.sold = categoryData;
      }

      if (propertyCategory === 'rented') {
        let whereClause = {
          status: propertyCategory,
        };
        whereClause.userId = {
          [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
        };

        if (startDate && endDate) {
          where.createdAt = {
            [Op.between]: [startDate, endDate],
          };
        }

        // eslint-disable-next-line no-await-in-loop
        categoryData = await product.findAll({
          where: whereClause,
          attributes: ['id', 'title', 'price', 'description', 'address', 'status', 'createdAt', 'updatedAt',
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
              )
            `), 'total_calls'],
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
                  AND NOT EXISTS (
                      SELECT 1
                      FROM "appointment_logs" AS al
                      WHERE al."appointment_id" = a."id"
                      AND al."user_id" = product.user_id
                      AND al."log_type" = '${APPOINTMENT_LOG_TYPE.JOINED}'
                  )
              )
            `), 'missed_calls'],
            [Sequelize.literal(`
              (
                  SELECT COUNT(*)
                  FROM "appointments" AS a
                  JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
                  WHERE ap."product_id" = product.id
                  AND a."status" IN ('pending', 'scheduled')
              )
            `), 'upcoming_appointments'],
            // [Sequelize.literal(`
            //     (
            //         SELECT JSON_OBJECT_AGG(COALESCE(a."co2_details", '{}'), a."id")
            //         FROM "appointments" AS a
            //         JOIN "appointment_products" AS ap ON a."id" = ap."appointment_id"
            //         WHERE ap."product_id" = product.id
            //         AND a."status" IN ('completed')
            //     )
            // `), 'co2DetailsSummary'],
          ],
          include: [
            {
              model: req.dbInstance.productMetaTag,
              attributes: ['value'],
              include: [
                {
                  model: req.dbInstance.categoryField,
                  attributes: ['id', 'label', 'type', 'options', 'required'],
                },
              ],
            },
            {
              model: productOffer,
              attributes: ['id', 'amount', 'status', 'rejectReason', 'acceptedAt'],
              include: [
                {
                  model: productSnagList,
                  include: [
                    {
                      model: productSnagListItem,
                    },
                  ],
                }, {
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
            },
            {
              model: productAllocation,
              attributes: [],
              include: [
                {
                  model: user,
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
            {
              model: appointment,
              attributes: ['id', 'appointmentDate', 'status', 'startMeetingTime', 'endMeetingTime', 'appointmentTimeGmt', 'co2Details'],
              include: [
                {
                  model: user,
                  as: 'customerUser',
                  attributes: ['firstName', 'lastName'],
                },
                {
                  model: user,
                  as: 'allotedAgentUser',
                  attributes: ['firstName', 'lastName'],
                },
              ],
            },
          ],
          distinct: true,
          order: [['createdAt', 'DESC']],
        });

        propertyData.rented = categoryData;
      }

      // if (propertyCategory === 'unsold') {
      //   let whereClause = {
      //     status: '',
      //   };
      //   whereClause.userId = {
      //     [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
      //   };

      //   if (startDate && endDate) {
      //     where.createdAt = {
      //       [Op.between]: [startDate, endDate],
      //     };
      //   }

      //   // eslint-disable-next-line no-await-in-loop
      //   categoryData = await product.findAll({
      //     where: whereClause,
      //     attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
      //     include: [
      //       {
      //         model: productOffer,
      //         attributes: ['id', 'amount', 'status', 'rejectReason'],
      //         where: {
      //           status: {
      //             [Op.in]: ['pending', 'rejected'],
      //           },
      //         },
      //         include: [
      //           {
      //             model: user,
      //             as: 'customer',
      //             attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
      //           },
      //         ],
      //       },
      //       {
      //         model: productLog,
      //         as: 'productViews',
      //         attributes: ['id', 'log_type', 'createdAt'],
      //         where: {
      //           log_type: 'viewed',
      //         },
      //       },
      //     ],
      //     distinct: true,
      //     order: [['createdAt', 'DESC']],
      //   });

      //   propertyData.unsold = categoryData;
      // }
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

    let agentIds = await getSubAgentIds(userInstance.id);
    agentIds.push(req.user.id);
    // console.log('agentIds', agentIds);

    // eslint-disable-next-line no-restricted-syntax
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

        // eslint-disable-next-line no-await-in-loop
        categoryData = await userSubscription.findAll({
          where: whereClause,
          // attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          include: [
            {
              model: feature,
              attributes: ['name'],
            },
          ],
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

      if (serviceCategory === 'analyticsAndReporting') {
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

        serviceData.analyticsAndReporting = categoryData;
      }
    }

    // Create a map of query parameter names to database column names
    const nameMap = {
      videoCall: 'Video Call',
      propertyListing: 'Property Listing',
      apiSubscription: 'API Subscription',
      analyticsAndReporting: 'Analytics And Reporting',
      carbonFootprint: 'Carbon Footprint',
      videoCallRecording: 'Video Call Recording',
      snagList: 'Snag List',
    };

    function getKeyByValue(value) {
      return Object.keys(nameMap).find(key => nameMap[key] === value);
    }

    const serviceFeatureIds = await Promise.all(
      serviceCategories.map(async (category) => {
        const feat = await feature.findOne({ where: { name: nameMap[category] } });
        return feat.id;
      }),
    );

    /// //////////////////////////////////////////////////////////////////////////////
    // Calculate additional metrics
    const featureUsage = {};
    const tokenTransactions = await tokenTransaction.findAll({
      where: {
        userId: userInstance.id,
        featureId: {
          [Op.in]: serviceFeatureIds,
        },
      },
    });

    // console.log('featureUsage: ', featureUsage);
    // console.log('serviceData: ', serviceData);

    tokenTransactions.forEach(async (transaction) => {
      const { featureId } = transaction;
      const featureName = await feature.findByPk(featureId);
      // console.log('featureId: ', featureId);
      // console.log('featureUsage[featureName.name]: ', featureUsage[featureName.name]);
      if (!featureUsage[getKeyByValue(featureName.name)]) {
        featureUsage[getKeyByValue(featureName.name)] = {
          totalUnitsUsed: 0,
          totalCoinsSpent: 0,
          amountSpentToBuyAllCoins: 0,
          autoRenew: null,
          autoRenewUnits: null,
        };
      }

      featureUsage[getKeyByValue(featureName.name)].totalUnitsUsed += transaction.quantity;
      featureUsage[getKeyByValue(featureName.name)].totalCoinsSpent += transaction.amount;

      // Calculate amountSpentToBuyAllCoins based on your token pricing logic
      // ...

      // Get autoRenew status and units from userSubscription
      const userSubs = await userSubscription.findOne({
        where: {
          userId: userInstance.id,
          featureId,
        },
      });

      if (userSubs) {
        featureUsage[getKeyByValue(featureName.name)].autoRenew = userSubs.autoRenew;
        featureUsage[getKeyByValue(featureName.name)].autoRenewUnits = userSubs.autoRenewUnits;
      }
      // console.log('featureUsage2: ', featureUsage);
    });

    // Add featureUsage data to serviceData
    // eslint-disable-next-line no-restricted-syntax
    for (const serviceCategory of serviceCategories) {
      // eslint-disable-next-line no-await-in-loop
      const feat = await feature.findOne({
        where: { name: toCapitalCase(serviceCategory) },
      });

      // console.log('serviceData: ', serviceData);
      // console.log('serviceCategory: ', serviceCategory);
      // console.log('serviceData[serviceCategory]: ', serviceData[serviceCategory]);

      serviceData[serviceCategory] = serviceData[serviceCategory].map((subscription) => {
        const userSubscriptionObj = subscription.toJSON();

        // Check if featureUsage has the calculated data for this feature
        const featureUsageData = featureUsage[getKeyByValue(feat.name)];
        if (featureUsageData) {
          return {
            ...userSubscriptionObj,
            totalUnitsUsed: featureUsageData.totalUnitsUsed || 0,
            totalCoinsSpent: featureUsageData.totalCoinsSpent || 0,
            amountSpentToBuyAllCoins: featureUsageData.amountSpentToBuyAllCoins || 0,
            autoRenew: featureUsageData.autoRenew || false,
            autoRenewUnits: featureUsageData.autoRenewUnits || 0,
          };
        }
        return userSubscriptionObj;
      });
    }

    return { serviceData };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Service error: getServicesData()', error });
  }
}
