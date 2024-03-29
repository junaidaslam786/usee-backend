import { AGENT_TYPE, SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from '@/config/constants';
// import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import { calculateDistanceMatrix } from '@/helpers/googleMapHelper';
const { Op } = Sequelize;
const {
  categoryField,
  user,
  userSubscription,
  agent,
  agentBranch,
  agentAvailability,
  product,
  productAllocation,
  productDocument,
  productImage,
  productLog,
  productMetaTag,
  productOffer,
  productReview,
  productVideo,
  productWishlist,
  productSnagList,
  productSnagListItem,
  CustomerWishlist,
  CustomerLog,
  UserAlert,
  ProductAllocation,
  agentAccessLevel,
  UserCallBackgroundImage,
  token,
  tokenTransaction,
  UserSubscription,
  role,
  feature,
  subscriptionFeature,
} = db.models;

// GET /agent/analytics/users?startDate=2022-01-01&endDate=2022-01-31&search=john&page=1&limit=10
export async function getUsersAnalytics(req, res, userInstance) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

  const where = userInstance.agent.agentType == AGENT_TYPE.AGENT ? { agentId: userInstance.id } : { managerId: userInstance.id };

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
      where: where,
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

    let activeUsers = 0,
      nonActiveUsers = 0,
      managerUsers = 0,
      staffUsers = 0;
    for (const agent of rows) {
      agent.user.active ? activeUsers++ : nonActiveUsers++;
      if (agent.agentType === USER_TYPE.AGENT) agentUsers++;
      if (agent.agentType === AGENT_TYPE.MANAGER) managerUsers++;
      if (agent.agentType === AGENT_TYPE.STAFF) staffUsers++;
    }

    return {
      rows,
      totalUsers: count,
      activeUsers,
      nonActiveUsers,
      managerUsers,
      staffUsers,
    };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getActiveUsersAnalytics(req, res) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

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
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getNonActiveUsersAnalytics(req, res) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

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
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCustomersAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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

    let activeCustomers = 0,
      nonActiveCustomers = 0,
      revenue_generated = 0,
      propertiesUnderOffer = 0,
      propertiesRented = 0;
    for (const customer of rows) {
      customer.active ? activeCustomers++ : nonActiveCustomers++;
    }
    for (const productOffer of propertiesBought.rows) {
      productOffer.status === 'accepted' ? (revenue_generated += Number(productOffer.amount)) : false;
      productOffer.status === 'pending' ? propertiesUnderOffer++ : false;
    }

    return {
      // rows,
      totalCustomers: count,
      activeCustomers,
      nonActiveCustomers,
      propertiesBought: propertiesBought.count,
      propertiesRented,
      propertiesUnderOffer,
      revenue_generated,
    };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getActiveCustomersAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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
  const { startDate, endDate, search, page, limit } = req.query;

  const where = userInstance.agent.agentType == AGENT_TYPE.AGENT ? { agentId: userInstance.id } : { managerId: userInstance.id };

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

    let totalAgents = 0,
      activeAgents = 0,
      inactiveAgents = 0;
    for (const agent of agents) {
      if (agent.user.active) {
        activeAgents++;
      } else {
        inactiveAgents++;
      }
    }
    totalAgents = activeAgents + inactiveAgents;

    return {
      rows: agents,
      totalAgents,
      activeAgents,
      inactiveAgents,
      // servicesBought: agentTokensTransactions.count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

async function getSubAgentIds(userId) {
  try {
    const subAgents = await agent.findAll({
      where: { agentId: userId },
      attributes: ['userId'],
    });

    const subAgentIds = subAgents.map(subAgent => subAgent.userId);
    return subAgentIds;
  } catch (error) {
    console.error('Error retrieving sub-agent IDs:', error);
    throw error;
  }
}

export async function getActiveAgentsAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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
  const { startDate, endDate, search, page, limit } = req.query;

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

    let activeSubscriptions = 2,
      cancelledSubscriptions = 1,
      expiredSubscriptions = 0;
    for (const subscription of rows) {
      if (subscription.status === 'active') activeSubscriptions++;
      if (subscription.status === 'cancelled') cancelledSubscriptions++;
      if (subscription.status === 'expired') expiredSubscriptions++;
    }

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
  const { startDate, endDate, search, page, limit } = req.query;

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

    let totalTokens = 0,
      tokensUsed = 0,
      tokensRemaining = 0,
      pendingTokens = 0,
      revenue_generated = 0;
    for (const token of rows) {
      if (token.valid) {
        revenue_generated += token.totalAmount;
        tokensUsed += token.quantity - token.remainingAmount;
        tokensRemaining += token.remainingAmount;
      }

      if (!token.valid) {
        pendingTokens += token.totalAmount;
      }
    }
    totalTokens = tokensUsed + tokensRemaining + pendingTokens;

    return {
      rows,
      totalTokens,
      tokensUsed,
      tokensRemaining,
      pendingTokens,
      revenue_generated,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getFeaturesAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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

    return {
      rows,
      count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getSubscriptionFeaturesAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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

    return {
      rows,
      count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getTokenTransactionsAnalytics(req, res, userInstance) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = userInstance.agent.agentType == AGENT_TYPE.AGENT ? { agentId: userInstance.id } : { managerId: userInstance.id };

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

    return {
      rows,
      count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyVisits(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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

    return {
      rows,
      count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyVisitsAlt(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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
        log_type: 'viewed',
      },
    });

    return {
      rows,
      allProductsViews: allProductsViews.count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCallDuration(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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

    return {
      rows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getUnresponsiveAgents(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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

export async function getRequestsSent(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

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
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {};
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
              [Op.in]: userInstance.agent.agentType == AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
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

    return {
      rows,
      count,
      acceptedOffers,
      rejectedOffers,
      pendingOffers,
    };
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCarbonFootprint(req, res) {
  const { agentLocation, propertyLocation } = req.body;

  try {
    const distanceMatrix = await calculateDistanceMatrix(agentLocation, propertyLocation);
    // console.log("distance", distance);

    if (distanceMatrix && distanceMatrix.length > 0 && distanceMatrix[0].status === 'OK') {
      const distanceMatrixValue = distanceMatrix[0].distance.value;
      // Assuming average CO2 emissions per mile
      const co2EmissionsPerMile = 0.404; // in kilograms
      const co2SavedValue = distanceMatrixValue * co2EmissionsPerMile;
      const co2SavedText = `${co2SavedValue} metric tons CO₂E`;
      res.json({ distance: distanceMatrix[0].distance.text, time: distanceMatrix[0].duration.text, co2SavedText });
    } else {
      res.status(400).json({ message: 'Invalid distance matrix response' });
    }
  } catch (err) {
    console.error('Error calculating carbon footprint:', err);
    res.status(500).json({ message: 'Server error', err });
  }
}

export async function getPropertiesSoldRented(req, res, userInstance) {
  const { startDate, endDate, search, page, limit } = req.query;

  let agentIds = await getSubAgentIds(userInstance.id);
  agentIds.push(req.user.id);

  const where = {
    status: {
      [Op.in]: ['active'],
    },
  };
  where.userId = {
    [Op.in]: userInstance.agent.agentType == AGENT_TYPE.AGENT ? [userInstance.id] : agentIds,
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
    const propertiesForSale = await product.findAndCountAll({
      where,
      // attributes: ["id", "title", "price", "description"],
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
          attributes: ['id', 'amount', 'notes', 'status', 'rejectReason'],
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
      limit: limit ? parseInt(limit, 10) : 10,
    });

    const propertiesForRent = await product.findAndCountAll({
      where,
      // attributes: ["id", "title", "price", "description"],
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
          attributes: ['id', 'amount', 'notes', 'status', 'rejectReason'],
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
      limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      // propertiesSoldData: propertiesForSale.rows,
      // propertiesRentedData: propertiesForRent.rows,
      propertiesSold: propertiesForSale.count,
      propertiesRented: propertiesForRent.count,
    };
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesListed(req, res, userInstance) {
  const { startDate, endDate, search, page, limit } = req.query;

  let agentIds = await getSubAgentIds(userInstance.id);
  agentIds.push(req.user.id);

  const where = userInstance.agent.agentType == AGENT_TYPE.AGENT ? { agentId: userInstance.id } : { managerId: userInstance.id };

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
              [Op.in]: userInstance.agent.agentType == AGENT_TYPE.AGENT ? agentIds : [userInstance.id],
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

    const propertiesOffers = await productOffer.findAndCountAll({});

    let revenue_generated = 0,
      propertiesUnderOffer = 0;
    // for (const total of rows) {
    //   customer.active ? activeCustomers++ : nonActiveCustomers++;
    // }

    for (const productOffer of propertiesOffers.rows) {
      productOffer.status === 'accepted' ? (revenue_generated += Number(productOffer.amount)) : false;
      productOffer.status === 'pending' ? propertiesUnderOffer++ : false;
    }

    return {
      rows: propertiesListed.rows,
      propertiesListed: propertiesListed.count,
      revenue_generated,
      propertiesUnderOffer,
    };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getAgentDetails(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    branchId: {
      [Op.not]: null,
    },
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
    const { rows, count } = await agent.findAndCountAll({
      where,
      include: [
        {
          model: agentBranch,
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      // offset: page ? parseInt(page, 10) * parseInt(limit, 10) : 0,
      // limit: limit ? parseInt(limit, 10) : 10,
    });

    return {
      rows,
      count,
      // totalAgentDetails,
    };
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}
