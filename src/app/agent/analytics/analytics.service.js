/* eslint-disable no-unused-vars */
import {
  AGENT_TYPE,
  APPOINTMENT_LOG_TYPE,
  USER_TYPE,
} from '@/config/constants';
import db from '@/database';
import { Sequelize } from 'sequelize';
import { calculateDistanceMatrix } from '@/helpers/googleMapHelper';

const { Op } = Sequelize;
const {
  agent,
  agentAccessLevel,
  agentAvailability,
  agentBranch,
  agentTimeSlot,
  appointment,
  appointmentNote,
  appointmentLog,
  feature,
  product,
  productAllocation,
  productDocument,
  productImage,
  productLog,
  productMetaTag,
  productOffer,
  productSnagList,
  productSnagListItem,
  role,
  subscriptionFeature,
  token,
  tokenTransaction,
  user,
  userSubscription,
} = db.models;

// GET /agent/analytics/users?startDate=2022-01-01&endDate=2022-01-31&search=john&page=1&limit=10
export async function getUsersAnalytics(req, res, userInstance) {
  const {
    userType,
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = userInstance.agent.agentType === AGENT_TYPE.AGENT
    ? { agentId: userInstance.id } : { managerId: userInstance.id };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await agent.findAndCountAll({
      where,
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
      order: [['id', 'DESC']],
      // offset: limit * (page - 1),
      // limit: limit,
    });

    let activeUsers = 0;
    let nonActiveUsers = 0;
    let agentUsers = 0;
    let managerUsers = 0;
    let staffUsers = 0;

    rows.forEach((rowAgent) => {
      if (rowAgent.user.active) {
        activeUsers += 1;
      } else {
        nonActiveUsers += 1;
      }

      if (rowAgent.agentType === USER_TYPE.AGENT) {
        agentUsers += 1;
      }

      if (rowAgent.agentType === AGENT_TYPE.MANAGER) {
        managerUsers += 1;
      }

      if (rowAgent.agentType === AGENT_TYPE.STAFF) {
        staffUsers += 1;
      }
    });

    return {
      rows,
      totalUsers: count,
      activeUsers,
      nonActiveUsers,
      managerUsers,
      staffUsers,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getActiveUsersAnalytics(req, res) {
  const {
    userType,
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {
    userType: {
      [Op.in]: userType ? userType.split(',') : Object.values(USER_TYPE),
    },
    active: true,
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await user.findAndCountAll({
      where,
      include: [
        {
          model: agent,
          as: 'agent',
          attributes: ['id', 'companyName'],
        },
        {
          model: role,
          as: 'role',
          attributes: ['id', 'name'],
        },
        {
          model: agentAccessLevel,
          as: 'agentAccessLevels',
          attributes: ['id', 'accessLevel'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getNonActiveUsersAnalytics(req, res) {
  const {
    userType,
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {
    userType: {
      [Op.in]: userType ? userType.split(',') : Object.values(USER_TYPE),
    },
    active: false,
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await user.findAndCountAll({
      where,
      include: [
        {
          model: agent,
          as: 'agent',
          attributes: ['id', 'companyName'],
        },
        {
          model: role,
          as: 'role',
          attributes: ['id', 'name'],
        },
        {
          model: agentAccessLevel,
          as: 'agentAccessLevels',
          attributes: ['id', 'accessLevel'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCustomersAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {
    userType: USER_TYPE.CUSTOMER,
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await user.findAndCountAll({
      where,
      include: [
        {
          model: agent,
          as: 'agent',
          attributes: ['id', 'companyName'],
        },
        {
          model: role,
          as: 'role',
          attributes: ['id', 'name'],
        },
        {
          model: agentAccessLevel,
          as: 'agentAccessLevels',
          attributes: ['id', 'accessLevel'],
        },
      ],
      distinct: true,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    const propertiesBought = await productOffer.findAndCountAll({});

    let activeCustomers = 0;
    let nonActiveCustomers = 0;
    let revenueGenerated = 0;
    let propertiesUnderOffer = 0;
    let propertiesRented = 0;

    activeCustomers = rows.reduce((totalActive, customer) => totalActive + (customer.active ? 1 : 0), 0);
    nonActiveCustomers = rows.reduce((totalNonActive, customer) => totalNonActive + (customer.active ? 0 : 1), 0);
    revenueGenerated = propertiesBought.rows.reduce((totalRevenue, offer) => {
      if (offer.status === 'accepted') {
        return totalRevenue + Number(offer.amount);
      }
      return totalRevenue;
    }, 0);
    propertiesUnderOffer = propertiesBought.rows.reduce((totalUnderOffer, offer) => {
      if (offer.status === 'pending') {
        return totalUnderOffer + 1;
      }
      return totalUnderOffer;
    }, 0);
    propertiesRented = 0; // Add your logic here to calculate the value of propertiesRented

    return {
      // rows,
      totalCustomers: count,
      activeCustomers,
      nonActiveCustomers,
      propertiesBought: propertiesBought.count,
      propertiesRented,
      propertiesUnderOffer,
      revenueGenerated,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getActiveCustomersAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {
    userType: USER_TYPE.CUSTOMER,
    active: true,
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await user.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getAgentsAnalytics(req, res, userInstance) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = userInstance.agent.agentType === AGENT_TYPE.AGENT
    ? { agentId: userInstance.id } : { managerId: userInstance.id };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const agents = await agent.findAll({
      where,
      include: [
        {
          model: user,
          attributes: ['id', 'active'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page && limit ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    // const agentTokensTransactions = await getTokenTransactionsAnalytics(req, res, userInstance);

    let totalAgents = 0;
    let activeAgents = 0;
    let inactiveAgents = 0;
    agents.forEach((a) => {
      if (a.user.active) {
        activeAgents += 1;
      } else {
        inactiveAgents += 1;
      }
    });
    totalAgents = activeAgents + inactiveAgents;

    return {
      rows: agents,
      totalAgents,
      activeAgents,
      inactiveAgents,
      // servicesBought: agentTokensTransactions.count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
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

export async function getActiveAgentsAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await agent.findAndCountAll({
      where,
      include: [
        {
          model: user,
          as: 'user',
          attributes: ['id', 'active'],
          where: {
            active: true,
          },
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getSubscriptionsAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await userSubscription.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    let activeSubscriptions = 1;
    let cancelledSubscriptions = 1;
    let expiredSubscriptions = 1;
    rows.forEach((subscription) => {
      if (subscription.status === 'active') activeSubscriptions += 1;
      if (subscription.status === 'cancelled') cancelledSubscriptions += 1;
      if (subscription.status === 'expired') expiredSubscriptions += 1;
    });

    return {
      rows,
      totalSubscriptions: count,
      activeSubscriptions,
      cancelledSubscriptions,
      expiredSubscriptions,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getTokensAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await token.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page && limit ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    let totalTokens = 0;
    let tokensUsed = 0;
    let tokensRemaining = 0;
    let pendingTokens = 0;
    let revenueGenerated = 0;

    revenueGenerated = rows.reduce((total, currentToken) => {
      if (currentToken.valid) {
        return total + currentToken.totalAmount;
      }
      return total;
    }, 0);

    tokensUsed = rows.reduce((total, currentToken) => {
      if (currentToken.valid) {
        return total + (currentToken.quantity - currentToken.remainingAmount);
      }
      return total;
    }, 0);

    tokensRemaining = rows.reduce((total, currentToken) => {
      if (currentToken.valid) {
        return total + currentToken.remainingAmount;
      }
      return total;
    }, 0);

    pendingTokens = rows.reduce((total, currentToken) => {
      if (!currentToken.valid) {
        return total + currentToken.totalAmount;
      }
      return total;
    }, 0);

    totalTokens = tokensUsed + tokensRemaining + pendingTokens;

    res.status(200).json({
      rows,
      totalTokens,
      tokensUsed,
      tokensRemaining,
      pendingTokens,
      revenueGenerated,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getFeaturesAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await feature.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    res.status(200).json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getSubscriptionFeaturesAnalytics(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await subscriptionFeature.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    res.status(200).json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getTokenTransactionsAnalytics(req, res, userInstance) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = userInstance.agent.agentType === AGENT_TYPE.AGENT
    ? { agentId: userInstance.id } : { managerId: userInstance.id };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        quantity: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        amount: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await tokenTransaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page && limit ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      // limit: limit ? parseInt(limit, 10) : 10,
    });

    res.status(200).json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyVisits(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await tokenTransaction.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    res.status(200).json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyVisitsAlt(req, res) {
  // eslint-disable-next-line no-shadow
  const { user } = req;

  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  let where = {};

  if (startDate && endDate) {
    where = {
      createdAt: {
        [Op.between]: [startDate, endDate],
      },
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  where.userId = user.id;

  try {
    const rows = await product.findAll({
      where,
      attributes: ['id', 'title', 'price', 'description'],
      include: [
        {
          model: productLog,
          as: 'productViews',
          where: {
            log_type: 'viewed',
          },
        },
      ],
      // order: [['created_at', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    const allProductsViews = await productLog.findAndCountAll({
      where: {
        userId: user.id,
        log_type: 'viewed',
      },
    });

    res.status(200).json({
      rows,
      allProductsViews: allProductsViews.count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

function getClientStayDuration(startMeetingTime, endMeetingTime) {
  const epochStartDateTime = new Date(startMeetingTime * 1000);
  const epochEndDateTime = new Date(endMeetingTime * 1000);
  const epochDuration = (endMeetingTime - startMeetingTime) * 1000;
  const d = new Date(epochDuration);
  // const durationInMinutes = Math.floor(durationInSeconds / 60);
  // const durationInHours = Math.floor(durationInMinutes / 60);

  const duration = {
    epochStartDateTimeLoc: epochStartDateTime.toLocaleString(),
    epochStartDateTimeUtc: epochStartDateTime.toUTCString(),
    epochEndDateTimeLoc: epochEndDateTime.toLocaleString(),
    epochEndDateTimeUtc: epochEndDateTime.toUTCString(),
    d,
    // hours: durationInHours % 24,
    // minutes: durationInMinutes % 60,
    // seconds: durationInSeconds % 60,
  };

  return duration;
}

export async function getCallDuration(req, res) {
  const { user } = req;

  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        name: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  where.agentId = user.id;
  where.status = 'completed';

  try {
    const { rows, count } = await appointment.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    const updatedRows = rows.map((row) => {
      const checkInDate = row.startMeetingTime;
      const checkOutDate = row.endMeetingTime;
      const stayDuration = getClientStayDuration(checkInDate, checkOutDate);
      return { ...row, clientStayDuration: stayDuration };
    });

    return {
      rows,
      updatedRows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getUnresponsiveAgents(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const agentsData = await user.findAll({
      where: {
        userType: USER_TYPE.AGENT,
      },
      attributes: [
        'firstName',
        'lastName',
        'email',
        'phoneNumber',
        'profileImage',
        [Sequelize.literal(`
          (
            SELECT COUNT(*)
            FROM "appointments" AS a
            WHERE a."alloted_agent" = "user"."id"
          )
        `), 'total_calls'],
        [Sequelize.literal(`
          (
            SELECT COUNT(*)
            FROM "appointments" AS a
            WHERE a."alloted_agent" = "user"."id"
            AND NOT EXISTS (
              SELECT 1
              FROM "appointment_logs" AS al
              WHERE al."appointment_id" = a."id"
              AND al."user_id" = "user"."id"
              AND al."log_type" = '${APPOINTMENT_LOG_TYPE.JOINED}'
            )
          )
        `), 'missed_calls'],
      ],
      include: [
        {
          model: agent,
          where: { agentId: req.user.id },
          attributes: ['id', 'agentType', 'companyName', 'companyPosition', 'branchId', 'job_title'],
        },
        {
          model: appointment,
          attributes: [],
          include: [
            {
              model: appointmentLog,
              attributes: [],
              where: {
                userType: USER_TYPE.AGENT,
              },
              required: false,
            },
          ],
        },
      ],
      group: ['user.id', 'agent.id', 'appointments.id', 'appointments->appointmentLogs.id'],
      // order: [[appointment, appointmentLog, 'createdAt', 'ASC']],
      order: [
        [Sequelize.literal('missed_calls'), 'ASC'],
      ],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      // limit: limit ? parseInt(limit, 10) : 10,
    });

    if (agentsData.length === 0) {
      return { success: true, message: 'No agents found with missed calls' };
    }

    // res.status(200).json(agents);
    return {
      agents: agentsData,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getRequestsSent(req, res) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await agent.findAndCountAll({
      where,
      include: [
        {
          model: agentBranch,
          attributes: ['id', 'name'],
        },
        {
          model: agentAvailability,
          attributes: ['id', 'timeSlotId', 'dayId', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyOffers(req, res, userInstance) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};
  // eslint-disable-next-line prefer-const
  let agentIds = await getSubAgentIds(userInstance.id);
  agentIds.push(req.user.id);

  where.status = {
    [Op.in]: ['accepted', 'pending', 'rejected'],
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await productOffer.findAndCountAll({
      where,
      include: [
        {
          model: product,
          // as: "product",
          attributes: ['id', 'title', 'price', 'description'],
          where: {
            userId: {
              [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
            },
          },
        },
      ],
      distinct: true,
      order: [['createdAt', 'DESC']],
      offset: page && limit ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    let acceptedOffers = 0;
    let rejectedOffers = 0;
    let pendingOffers = 0;
    // eslint-disable-next-line no-restricted-syntax
    for (const offer of rows) {
      if (offer.status === 'accepted') acceptedOffers += 1;
      if (offer.status === 'rejected') rejectedOffers += 1;
      if (offer.status === 'pending') pendingOffers += 1;
    }

    res.status(200).json({
      rows,
      count,
      acceptedOffers,
      rejectedOffers,
      pendingOffers,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCarbonFootprint(req, res) {
  const { agentLocation, propertyLocation } = req.body;

  try {
    const distanceMatrix = await calculateDistanceMatrix(agentLocation, propertyLocation);

    if (distanceMatrix && distanceMatrix.length > 0 && distanceMatrix[0].status === 'OK') {
      const distanceMatrixValue = distanceMatrix[0].distance.value;
      // Assuming average CO2 emissions per mile
      const co2EmissionsPerMile = 0.404; // in kilograms
      const co2SavedValue = (distanceMatrixValue * co2EmissionsPerMile).toFixed(2);
      const co2SavedText = `${co2SavedValue} ${process.env.CO2_UNIT}`;
      return {
        distance: distanceMatrix[0].distance.text,
        time: distanceMatrix[0].duration.text,
        co2SavedText,
        co2SavedValue,
      };
    }
    return { error: true, message: 'Invalid distance matrix response' };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error calculating carbon footprint:', err);
    return { error: true, message: 'Server error', err };
  }
}

export async function getPropertyCarbonFootprintAnalytics(req, res) {
  const { appointmentId, productId } = req.body;
  const { userInstance } = req.user;

  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = { userId: req.user.id };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        quantity: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        amount: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  console.log('UI: ', userInstance);

  // let carbonSavingProperties = 0;
  // let carbonSavingAppointments = 0;

  // if (productId) {
  //   // Assuming you have a function countCarbonSavingProperties that takes a productId and returns the count
  //   carbonSavingProperties = await countCarbonSavingProperties(productId);
  // }

  // if (appointmentId) {
  //   // Assuming you have a function countCarbonSavingAppointments that takes an appointmentId and returns the count
  //   carbonSavingAppointments = await countCarbonSavingAppointments(appointmentId);
  // }

  try {
    const { rows, count } = await product.findAndCountAll({
      where,
      include: [
        {
          model: appointment,
          attributes: ['id', 'co2Details'],
          where: {
            co2Details: {
              [Op.not]: null,
            },
          },
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error calculating carbon footprint:', err);
    return { error: true, message: 'Server error', err };
  }
}

export async function getAppointmentCarbonFootprintAnalytics(req, res) {
  const { appointmentId, productId } = req.body;
  const { userInstance } = req.user;

  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = req.user.agent.agentType === AGENT_TYPE.AGENT
    ? { agentId: req.user.id } : { managerId: req.user.id };

  // where.co2Details = {
  //   [Op.not]: null,
  // };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        quantity: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        amount: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const { rows, count } = await appointment.findAndCountAll({
      where,
      include: [
        {
          model: product,
          attributes: ['id', 'title', 'description', 'price', 'featuredImage'],
          through: { attributes: [] },
        },
        {
          model: user,
          as: 'customerUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage', 'timezone'],
        },
        {
          model: user,
          as: 'agentUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage', 'timezone'],
          include: [
            {
              model: agent,
              attributes: ['id', 'agentType'],
            },
          ],
        },
        {
          model: user,
          as: 'allotedAgentUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage', 'timezone'],
        },
        {
          model: agentTimeSlot,
        },
        {
          model: appointmentNote,
          attributes: ['id', 'notes'],
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error calculating carbon footprint:', err);
    return { error: true, message: 'Server error', err };
  }
}

export async function getPropertiesSoldRented(req, res, userInstance) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  // eslint-disable-next-line prefer-const
  let agentIds = await getSubAgentIds(userInstance.id);
  agentIds.push(req.user.id);

  const where = {};
  where.userId = {
    [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        address: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        city: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        region: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    // Properties Sold
    const { rows: propertiesSold, count: propertiesSoldCount } = await product.findAndCountAll({
      where,
      attributes: ['id', 'title', 'price', 'description'],
      include: [
        {
          model: user,
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },
        {
          model: productDocument,
          attributes: ['id', 'title', 'file'],
        },
        {
          model: productImage,
          attributes: ['id', 'image', 'sort_order'],
        },
        {
          model: productMetaTag,
          attributes: ['value'],
          where: {
            key: 2,
            value: 'sale',
          },
        },
        {
          model: productOffer,
          attributes: ['id', 'amount', 'notes', 'status', 'rejectReason', 'acceptedAt'],
          where: {
            status: {
              [Op.in]: ['accepted'],
            },
          },
          include: [
            {
              model: user,
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: productSnagList,
              attributes: ['id', 'agentApproved', 'customerApproved'],
              include: [
                {
                  model: productSnagListItem,
                  attributes: ['snagKey', 'snagValue', ['customer_comment', 'cc'], ['agent_comment', 'ac']],
                },
              ],
            },
          ],
        },
        {
          model: productAllocation,
          attributes: ['id'],
          include: [
            {
              model: user,
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      distinct: true,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      // limit: limit ? parseInt(limit, 10) : 10,
    });

    // Properties Rented
    const { rows: propertiesRented, count: propertiesRentedCount } = await product.findAndCountAll({
      where,
      attributes: ['id', 'title', 'price', 'description'],
      include: [
        {
          model: user,
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },
        {
          model: productDocument,
          attributes: ['id', 'title', 'file'],
        },
        {
          model: productImage,
          attributes: ['id', 'image', 'sort_order'],
        },
        {
          model: productMetaTag,
          attributes: ['value'],
          where: {
            key: 2,
            value: 'rent',
          },
        },
        {
          model: productOffer,
          attributes: ['id', 'amount', 'notes', 'status', 'rejectReason', 'acceptedAt'],
          where: {
            status: {
              [Op.in]: ['accepted'],
            },
          },
          include: [
            {
              model: user,
              attributes: ['id', 'firstName', 'lastName', 'email'],
            },
            {
              model: productSnagList,
              attributes: ['id', 'agentApproved', 'customerApproved'],
              include: [
                {
                  model: productSnagListItem,
                  attributes: ['snagKey', 'snagValue', ['customer_comment', 'cc'], ['agent_comment', 'ac']],
                },
              ],
            },
          ],
        },
        {
          model: productAllocation,
          attributes: ['id'],
          include: [
            {
              model: user,
              attributes: ['id', 'firstName', 'lastName'],
            },
          ],
        },
      ],
      distinct: true,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      // limit: limit ? parseInt(limit, 10) : 10,
    });

    res.status(200).json({
      propertiesSold,
      propertiesSoldCount,
      propertiesRented,
      propertiesRentedCount,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesListed(req, res, userInstance) {
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  // eslint-disable-next-line prefer-const
  let agentIds = await getSubAgentIds(userInstance.id);
  agentIds.push(req.user.id);

  const where = userInstance.agent.agentType === AGENT_TYPE.AGENT
    ? { agentId: userInstance.id } : { managerId: userInstance.id };

  where.status = {
    [Op.in]: ['active'],
  };

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        title: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        description: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        address: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        city: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        region: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  try {
    const propertiesListed = await user.findAndCountAll({
      where: {
        userType: USER_TYPE.AGENT,
      },
      include: [
        {
          model: agent,
          attributes: ['id', 'agentType', 'companyName', 'companyPosition', 'branchId', 'job_title'],
        },
        {
          model: product,
          // as: "products",
          attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
          where: {
            userId: {
              [Op.in]: userInstance.agent.agentType === AGENT_TYPE.AGENT ? agentIds : [userInstance.id],
            },
            status: {
              [Op.in]: ['active'],
            },
          },
        },
      ],
      distinct: true,
      group: ['user.id', 'agent.id', 'products.id', 'agent.job_title'],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      // limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows: propertiesListed.rows,
      propertiesListed: propertiesListed.count,
      // revenueGenerated,
      // propertiesUnderOffer,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getAgentDetails(req, res) {
  const { user: currentUser } = req;
  const {
    startDate,
    endDate,
    search,
    page,
    limit,
  } = req.query;

  const where = {};

  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [startDate, endDate],
    };
  }

  if (search) {
    where[Op.or] = [
      {
        firstName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        lastName: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        email: {
          [Op.iLike]: `%${search}%`,
        },
      },
      {
        phoneNumber: {
          [Op.iLike]: `%${search}%`,
        },
      },
    ];
  }

  where.agentId = currentUser.id;

  try {
    const { rows, count } = await agent.findAndCountAll({
      where,
      include: [
        {
          model: agentBranch,
          attributes: ['id', 'name'],
          required: false,
        },
        {
          model: user,
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },
        {
          model: productAllocation,
          attributes: ['id'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
      // totalAgentDetails,
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}
