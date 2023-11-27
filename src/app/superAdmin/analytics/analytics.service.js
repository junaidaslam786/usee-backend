import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from '@/config/constants';

import { utilsHelper } from '@/helpers';
import db from '@/database';
import { Sequelize } from 'sequelize';

const { Op } = Sequelize;

const { user, agent, agentBranch, agentAvailability, product, productOffer, CustomerWishlist, CustomerLog, UserAlert, ProductAllocation, agentAccessLevel, UserCallBackgroundImage, token, tokenTransaction, UserSubscription, role, feature, subscriptionFeature, FeatureSubscriptionTransaction, FeatureSubscriptionTransactionDetail, FeatureSubscriptionTransactionDetailAddon, FeatureSubscriptionTransactionDetailFeature, FeatureSubscriptionTransactionDetailFeatureAddon, FeatureSubscriptionTransactionDetailFeatureAddonFeature, FeatureSubscriptionTransactionDetailFeatureAddonFeatureAddon, FeatureSubscriptionTransactionDetailFeatureAddonFeatureAddonFeature } = db.models;

// GET /api/analytics/users?userType=admin&startDate=2022-01-01&endDate=2022-01-31&search=john&page=1&limit=10
export async function getUsersAnalytics(req, res) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

  if (!startDate || !endDate) {
    console.error('Start date and end date are required');
    res.status(400).json({ message: 'Start date and end date are required' });
  }

  const where = {
    userType: {
      [Op.in]: userType ? userType.split(',') : Object.values(USER_TYPE),
    },
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getActiveUsersAnalytics(req, res) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

  if (!startDate || !endDate) {
    console.error('Start date and end date are required');
    res.status(400).json({ message: 'Start date and end date are required' });
  }

  const where = {
    userType: {
      [Op.in]: userType ? userType.split(',') : Object.values(USER_TYPE),
    },
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
    active: true,
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getNonActiveUsersAnalytics(req, res) {
  const { userType, startDate, endDate, search, page, limit } = req.query;

  if (!startDate || !endDate) {
    console.error('Start date and end date are required');
    res.status(400).json({ message: 'Start date and end date are required' });
  }

  const where = {
    userType: {
      [Op.in]: userType ? userType.split(',') : Object.values(USER_TYPE),
    },
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
    active: false,
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getSubscriptionsAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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
    const { rows, count } = await product.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return res.json({
      rows,
      count,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getTokensAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    let totalTokens = 0, totalTokensUsed = 0, totalTokensRemaining = 0, pendingTokens = 0;
    for (const token of rows) {
      if (token.valid) {
        totalTokens += token.totalAmount;
        totalTokensUsed += token.totalAmount - token.remainingAmount;
        totalTokensRemaining += token.remainingAmount;
      }

      if (!token.valid) {
        pendingTokens += token.totalAmount;
      }
    }

    res.json({
      rows,
      count,
      totalTokens,
      totalTokensUsed,
      totalTokensRemaining,
      pendingTokens,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getFeaturesAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getSubscriptionFeaturesAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getTokenTransactionsAnalytics(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyVisits(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCallDuration(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
  };

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

    return res.json({
      rows,
      count,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getUnresponsiveAgents(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return res.json({
      rows,
      count,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getRequestsSent(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },
    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return res.json({
      rows,
      count,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertyOffers(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },

    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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

    res.json({
      rows,
      count,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getCarbonFootprint(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },

    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,
    });

    return res.json({
      rows,
      count,
      totalCarbonFoot,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesSoldRented(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },

    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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
    // Number of properties sold or rented each month, give me query for this
    // don't use the agent table, use the product table
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

    // res.json({
    //   propertiesSoldRentedByMonth,
    //   count,
    // });
    
    res.json({
      rows,
      count,
      propertiesSoldRentedByMonth,
    });
  }
  catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
}

export async function getPropertiesListed(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },

    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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
      ],
      order: [['createdAt', 'DESC']],
      offset: page ? parseInt(page) * parseInt(limit) : 0,
      limit: limit ? parseInt(limit) : 10,

    });
    const totalPropertiesListed = await agent.findAndCountAll({
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
      ],

    });
    return res.json
      ({
        rows,
        count,
        totalPropertiesListed,
      });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}

export async function getAgentDetails(req, res) {
  const { startDate, endDate, search, page, limit } = req.query;

  const where = {
    createdAt: {
      [Op.between]: [startDate, endDate],
    },

    status: {
      [Op.in]: ['pending', 'rejected'],
    },
  };

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
    return res.json
      ({
        rows,
        count,
        totalAgentDetails,
      });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error', error });
  }
}
