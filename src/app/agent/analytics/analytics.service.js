import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from '@/config/constants';

import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';
import { calculateDistance, calculateTime } from '@/helpers/googleMapHelper';

const { Op } = Sequelize;

const { user, userSubscription, agent, agentBranch, agentAvailability, product, productOffer, productLog, CustomerWishlist, CustomerLog, UserAlert, ProductAllocation, agentAccessLevel, UserCallBackgroundImage, token, tokenTransaction, UserSubscription, role, feature, subscriptionFeature } = db.models;

// GET /superadmin/analytics/users?userType=admin&startDate=2022-01-01&endDate=2022-01-31&search=john&page=1&limit=10
export async function getUsersAnalytics(req, res) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

  const where = {
    userType: {
      [Op.in]: userType ? userType.split(',') : Object.values(USER_TYPE),
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
    const rows = await user.findAll({
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    // get query to count all users in db
    const { count } = await user.findAndCountAll();

    let activeUsers = 0,
      nonActiveUsers = 0,
      customerUsers = 0,
      agentUsers = 0,
      adminUsers = 0,
      superAdminUsers = 0;
    for (const user of rows) {
      user.active ? activeUsers++ : nonActiveUsers++;
      if (user.userType === USER_TYPE.CUSTOMER) customerUsers++;
      if (user.userType === USER_TYPE.AGENT) agentUsers++;
      if (user.userType === USER_TYPE.ADMIN) adminUsers++;
      if (user.userType === USER_TYPE.SUPERADMIN) superAdminUsers++;
    }

    return {
      // rows,
      totalUsers: rows.length,
      activeUsers,
      nonActiveUsers,
      customerUsers,
      agentUsers,
      adminUsers,
      superAdminUsers,
      totalUsersAll: count,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,

    });

    const propertiesBought = await productOffer.findAndCountAll({});

    let activeCustomers = 0, nonActiveCustomers = 0, revenue_generated = 0, propertiesUnderOffer = 0, propertiesRented = 0;
    for (const customer of rows) {
      customer.active ? activeCustomers++ : nonActiveCustomers++;
    }
    for (const productOffer of propertiesBought.rows) {
      productOffer.status === 'accepted' ? revenue_generated += Number(productOffer.amount) : false;
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getAgentsAnalytics(req, res) {
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
    const agents = await agent.findAll({
      where,
      include: [
        {
          model: user,
          as: 'user',
          attributes: ['id', 'active'],
        }
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    const agentTokensTransactions = await getTokenTransactionsAnalytics(req, res);

    let totalAgents = 0, activeAgents = 0, inactiveAgents = 0;
    for (const agent of agents) {
      if (agent.user.active) {
        activeAgents++;
      } else {
        inactiveAgents++;
      }
    }
    totalAgents = activeAgents + inactiveAgents;

    return {
      // rows: agents,
      totalAgents,
      activeAgents,
      inactiveAgents,
      servicesBought: agentTokensTransactions.count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
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
        }
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    let activeSubscriptions = 2, cancelledSubscriptions = 1, expiredSubscriptions = 0;
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    let totalTokens = 0, tokensUsed = 0, tokensRemaining = 0, pendingTokens = 0, revenue_generated = 0;
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getTokenTransactionsAnalytics(req, res) {
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
      offset: page && limit ? parseInt(page) * parseInt(limit) : 0,
      // limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
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
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return {
      rows,
      count,
    };
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyOffers(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    status: {
      [Op.in]: ['accepted', 'pending', 'rejected'],
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
    const { rows, count } = await productOffer.findAndCountAll({
      where,
      include: [
        {
          model: product,
          as: 'product',
          attributes: ['id', 'title', 'price', 'description'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    let acceptedOffers = 0, rejectedOffers = 0, pendingOffers = 0;
    for (const offer of rows) {
      if (offer.status === 'accepted') acceptedOffers++;
      if (offer.status === 'rejected') rejectedOffers++;
      if (offer.status === 'pending') pendingOffers++;
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

  const distance = calculateDistance(agentLocation, propertyLocation);
  const time = calculateTime(agentLocation, propertyLocation);

  // Assuming average CO2 emissions per mile
  const co2EmissionsPerMile = 0.404; // in kilograms

  const co2Saved = distance * co2EmissionsPerMile;

  res.json({ co2Saved, time });
}

export async function getPropertiesSoldRented(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    status: {
      [Op.in]: ['pending', 'rejected'],
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
    const { rows, count } = await product.findAndCountAll({
      where,
      attributes: ['id', 'title', 'price', 'description'],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    console.log("ROWS: ", rows);

    const propertiesSoldRentedByMonth = rows.length ? rows.reduce((result, agent) => {
      agent.forEach(property => {
        const month = new Date(property.createdAt).getMonth();
        const year = new Date(property.createdAt).getFullYear();
        const key = `${month}-${year}`;
        if (result[key]) {
          result[key]++;
        } else {
          result[key] = 1;
        }
      });
      return result;
    }, {}) : 0;

    return {
      rows,
      count,
      propertiesSoldRentedByMonth,
    };
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesListed(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    status: {
      [Op.in]: ['active'],
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
    const propertiesListed = await product.findAndCountAll({
      where,
      attributes: ['id', 'title', 'price', 'description', 'address', 'status'],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      // limit: limit ? parseInt(limit) : 10,
    });

    const propertiesOffers = await productOffer.findAndCountAll({});

    let revenue_generated = 0, propertiesUnderOffer = 0;
    // for (const total of rows) {
    //   customer.active ? activeCustomers++ : nonActiveCustomers++;
    // }

    for (const productOffer of propertiesOffers.rows) {
      productOffer.status === 'accepted' ? revenue_generated += Number(productOffer.amount) : false;
      productOffer.status === 'pending' ? propertiesUnderOffer++ : false;
    }

    return {
      // rows,
      propertiesListed: propertiesListed.count,
      revenue_generated,
      propertiesUnderOffer,
    };
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getAgentDetails(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    status: {
      [Op.in]: ['pending', 'rejected'],
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
          model: AgentBranch,
          as: 'agentBranches',
          attributes: ['id', 'name'],
        },
        {
          model: AgentAvailability,
          as: 'agentAvailabilities',
          attributes: ['id', 'name'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
        },
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,

    });
    const totalAgentDetails = await agent.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
        },
      ],
    });

    return {
      rows,
      count,
      totalAgentDetails,
    };
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}
