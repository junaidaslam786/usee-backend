import { AGENT_TYPE, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, USER_TYPE, PROPERTY_ROOT_PATHS } from "@/config/constants";
import { utilsHelper, mailHelper } from "@/helpers";
import db from "@/database";
import * as userService from "../../user/user.service";
const path = require("path");
const ejs = require("ejs");
import { Sequelize } from "sequelize";
const OP = Sequelize.Op;
import timezoneJson from "../../../../timezones.json";

import Stripe from 'stripe';
import stripeConfig from '@/config/stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: stripeConfig.stripe.apiVersion,
});

export const listAgentUsers = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = reqBody && reqBody.size ? reqBody.size : 10;
    const page = reqBody && reqBody.page ? reqBody.page : 1;
    const search = reqBody && reqBody.search ? reqBody.search : "";

    const whereClause =
      agentInfo.agent.agentType == AGENT_TYPE.AGENT ? { agentId: agentInfo.id } : { managerId: agentInfo.id };
    const { count, rows } = await dbInstance.agent.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: dbInstance.user,
          where: {
            [OP.or]: [{ firstName: { [OP.iLike]: `%${search}%` } }, { lastName: { [OP.iLike]: `%${search}%` } }],
          },
          include: [
            {
              model: dbInstance.productAllocation,
            },
            {
              model: dbInstance.agentAccessLevel,
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
      offset: itemPerPage * (page - 1),
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
    console.log("listAgentUsersServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const listAgentUsersToAllocate = async (req) => {
  try {
    const { user: agentInfo, dbInstance } = req;

    const selectedUser = req.query.user ? req.query.user : agentInfo.id;
    return await dbInstance.agent.findAll({
      where: {
        [OP.or]: [{ agentId: selectedUser }, { managerId: selectedUser }],
      },
      attributes: ["userId"],
      include: [
        {
          model: dbInstance.user,
          attributes: ["firstName", "lastName"],
        },
      ],
      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log("listAgentUsersToAllocateServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const createAgentUser = async (reqBody, req) => {
  try {
    const { firstName, lastName, email, phoneNumber, role, branch, timezone } = reqBody;
    const { user: agentInfo, dbInstance } = req;
    const { agent, agentTimeSlot, agentAvailability } = dbInstance;

    if (agentInfo.agent.agentType === AGENT_TYPE.STAFF) {
      return { error: true, message: "You do not have permission to add user." };
    }

    const result = await db.transaction(async (transaction) => {
      const tempPassword = utilsHelper.generateRandomString(10);

      let sortWhere = { agentId: agentInfo.id };
      if (agentInfo.agent.agentType == AGENT_TYPE.MANAGER) {
        sortWhere = { managerId: agentInfo.id };
      }
      const latestSortOrderData = await dbInstance.agent.findOne({
        attributes: ["sortOrder"],
        where: sortWhere,
        order: [["createdAt", "desc"]],
        limit: 1,
      });
      const sortOrder = latestSortOrderData?.sortOrder ? latestSortOrderData.sortOrder + 1 : 1;

      let selectedTimezone = process.env.APP_DEFAULT_TIMEZONE;
      if (timezone) {
        const findTimezone = timezoneJson.find((tz) => tz.value === timezone);
        if (findTimezone) {
          selectedTimezone = findTimezone.value;
        }
      }

      // create user data
      const newUser = await userService.createUserWithPassword(
        {
          firstName,
          lastName,
          email: email.toLowerCase(),
          phoneNumber,
          status: true,
          userType: USER_TYPE.AGENT,
          password: tempPassword,
          signupStep: 2,
          otpVerified: true,
          createdBy: agentInfo.id,
          timezone: selectedTimezone,
        },
        transaction
      );

      // create agent user data
      let agentUserData = {
        userId: newUser.id,
        agentId: agentInfo.id,
        agentType: role,
        // branchId: branch,
        companyPosition: role === AGENT_TYPE.MANAGER ? "Manager" : "Staff",
        apiCode: utilsHelper.generateRandomString(10, true),
        sortOrder: sortOrder,
        createdBy: agentInfo.id,
      };

      if (agentInfo.agent.agentType == AGENT_TYPE.MANAGER) {
        agentUserData.agentId = agentInfo.agent.agentId;
        agentUserData.managerId = agentInfo.id;
      }

      await agent.create(agentUserData, { transaction });

      const timeslots = await agentTimeSlot.findAll();
      for (let day = 1; day <= 7; day++) {
        let agentAvailabilities = [];
        for (const slot of timeslots) {
          agentAvailabilities.push({
            userId: newUser.id,
            dayId: day,
            timeSlotId: slot.id,
            status: true,
          });
        }
        await agentAvailability.bulkCreate(agentAvailabilities, { transaction });
      }

      // create access levels
      const agentAccessLevels = [];
      for (const [key, value] of Object.entries(reqBody)) {
        if (key.startsWith("accessLevels[")) {
          agentAccessLevels.push({
            userId: newUser.id,
            accessLevel: value,
          });
        }
      }

      if (agentAccessLevels?.length > 0) {
        await dbInstance.agentAccessLevel.bulkCreate(agentAccessLevels, { transaction });
      } else {
        throw new Error("Sub-agent user requires at least one permission.");
      }

      const emailData = [];
      emailData.name = newUser.fullName;
      emailData.tempPassword = tempPassword;
      emailData.login = utilsHelper.generateUrl("agent-login", newUser.userType);
      const htmlData = await ejs.renderFile(
        path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_TEMP_PASSWORD),
        emailData
      );
      const payload = {
        to: newUser.email,
        subject: `${EMAIL_SUBJECT.AGENT_ADDED_AS} ${agentUserData.companyPosition}`,
        html: htmlData,
      };
      mailHelper.sendMail(payload);

      return newUser;
    });

    return result.id ? await getAgentUserDetailByUserId(result.id, dbInstance) : result;
  } catch (err) {
    console.log("createAgentUsersServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
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
    console.log("updateAgentUserBranchServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
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

      console.log("agent", agent);
      await agent.save({ transaction });
    });

    return true;
  } catch (err) {
    console.log("updateAgentUserSortingServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getAgentUser = async (agentUserId, dbInstance) => {
  try {
    const agentUser = await getAgentUserDetailByUserId(agentUserId, dbInstance);
    if (!agentUser) {
      return { error: true, message: "Invalid user id or user do not exist." };
    }

    return agentUser;
  } catch (err) {
    console.log("getAgentUserServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deleteAgentUser = async (userId, dbInstance) => {
  try {
    const agentUser = await getAgentUserByUserId(userId, dbInstance);
    if (!agentUser) {
      return { error: true, message: "Invalid user id or user do not exist." };
    }

    await db.transaction(async (transaction) => {
      await dbInstance.agentAccessLevel.destroy(
        {
          where: {
            userId,
          },
          force: true,
        },
        { transaction }
      );

      await dbInstance.agentAvailability.destroy(
        {
          where: {
            userId,
          },
          force: true,
        },
        { transaction }
      );

      await dbInstance.productAllocation.destroy(
        {
          where: {
            userId,
          },
          force: true,
        },
        { transaction }
      );

      await dbInstance.userCallBackgroundImage.destroy(
        {
          where: {
            userId,
          },
          force: true,
        },
        { transaction }
      );

      await dbInstance.agent.destroy(
        {
          where: {
            userId,
          },
          force: true,
        },
        { transaction }
      );

      await dbInstance.user.destroy(
        {
          where: {
            id: userId,
          },
          force: true,
        },
        { transaction }
      );
    });

    return true;
  } catch (err) {
    console.log("deleteAgentUserServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

const getAgentUserByUserId = async (agentUserId, dbInstance) => {
  const agentUser = await dbInstance.agent.findOne({ where: { userId: agentUserId } });

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
        include: [
          {
            model: dbInstance.product,
            attributes: ["id", "title", "description", "status"],
          },
          {
            model: dbInstance.productAllocation,
            include: [
              {
                model: dbInstance.product,
                attributes: ["id", "title", "description", "status"],
              },
            ],
          },
          {
            model: dbInstance.agentAccessLevel,
          },
        ],
      },
      {
        model: dbInstance.agentBranch,
        attributes: ["id", "name"],
      },
    ],
  });

  if (!agentUser) {
    return false;
  }

  return agentUser;
};

export const updateAgentUser = async (reqBody, req) => {
  try {
    const { userId, companyName, role, firstName, lastName, countryName, cityName, latitude, longitude, companyPosition, jobTitle, licenseNo, otpVerified, ornNumber, phoneNumber, status, userType, signupStep, timezone } = reqBody;
    const { user: agentInfo, dbInstance } = req;

    if (agentInfo.agent.agentType === AGENT_TYPE.STAFF) {
      return { error: true, message: "You do not have permission to update user." };
    }

    await db.transaction(async (transaction) => {
      const agentUser = await getAgentUserByUserId(userId, dbInstance);

      let sortWhere = { agentId: agentInfo.id };
      if (agentInfo.agent.agentType == AGENT_TYPE.MANAGER) {
        sortWhere = { managerId: agentInfo.id };
      }
      const latestSortOrderData = await dbInstance.agent.findOne({
        attributes: ["sortOrder"],
        where: sortWhere,
        order: [["createdAt", "desc"]],
        limit: 1,
      });
      const sortOrder = latestSortOrderData?.sortOrder ? latestSortOrderData.sortOrder + 1 : 1;

      let selectedTimezone = process.env.APP_DEFAULT_TIMEZONE;
      if (timezone) {
        const findTimezone = timezoneJson.find((tz) => tz.value === timezone);
        if (findTimezone) {
          selectedTimezone = findTimezone.value;
        }
      }

      agentUser.agentType = role;
      agentUser.companyName = companyName;
      agentUser.companyPosition = companyPosition;
      agentUser.jobTitle = jobTitle;
      agentUser.licenseNo = licenseNo;
      agentUser.sortOrder = sortOrder;
      agentUser.ornNumber = ornNumber;
      agentUser.createdBy = agentInfo.id;
      agentUser.updatedBy = agentInfo.id;

      if (req.files && req.files.document) {
        const documentFile = req.files.document;
        const newFileName = `${Date.now()}_${documentFile.name.replace(/ +/g, "")}`;
        const result = await utilsHelper.fileUpload(documentFile, PROPERTY_ROOT_PATHS.PROFILE_DOCUMENT, newFileName);
        if (result?.error) {
          return { error: true, message: result?.error }
        }
        agentUser.documentUrl = result;
      }

      await agentUser.save({ transaction });

      if (agentInfo.agentType !== AGENT_TYPE.STAFF) {
        // remove previous access levels
        await dbInstance.agentAccessLevel.destroy({
          where: {
            userId: agentUser.userId,
          },
        });

        // create access levels
        const agentAccessLevels = [];
        for (const [key, value] of Object.entries(reqBody)) {
          if (key.startsWith("accessLevels[")) {
            agentAccessLevels.push({
              userId: agentUser.userId,
              accessLevel: value,
            });
          }
        }

        if (agentAccessLevels?.length > 0) {
          await dbInstance.agentAccessLevel.bulkCreate(agentAccessLevels, { transaction });
        }
      }

      const user = await dbInstance.user.findOne({ where: { id: userId } });

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phoneNumber) user.phoneNumber = phoneNumber;
      if (cityName) user.cityName = cityName;
      if (countryName) user.countryName = countryName;
      if (latitude && longitude) {
        user.latitude = latitude;
        user.longitude = longitude;
        const point = db.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`, 4326);
        user.geometry = point;
      }
      if (status) user.status = status;
      if (userType) user.userType = userType;
      if (signupStep) user.signupStep = signupStep;
      if (otpVerified) user.otpVerified = otpVerified;
      if (selectedTimezone) user.timezone = selectedTimezone;
      if (agentInfo && agentInfo.id) {
        user.createdBy = agentInfo.id;
        user.updatedBy = agentInfo.id;
      }
      await user.save({ transaction });

      return agentUser;
    });

    return true;
  } catch (err) {
    console.log("createAgentUsersServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getUserSubscriptionDetails = async (userId, dbInstance) => {
  try {

    if (!userId) {
      return { error: true, message: "User ID is undefined" };
    }
    // const { subscriptionId } = reqBody;

    const userSubscriptions = await dbInstance.userSubscription.findAll({
      where: {
        userId: userId,
        subscription_id: "35e0b998-53bc-4777-a207-261fff3489aa",
        status: "active",
      },
      attributes: ["freeRemainingUnits", "paidRemainingUnits", "autoRenew", "autoRenewUnits", "startDate", "endDate", "status"],
      include: [
        {
          model: dbInstance.feature,
          attributes: [
            "id",
            "name",
            "description",
            "tokensPerUnit",
            "totalUnits",
            "freeUnits",
            "unitName",
            "unitType",
            "featureType",
          ],
        },
      ],
    });

    const subscription = await dbInstance.subscription.findByPk("35e0b998-53bc-4777-a207-261fff3489aa");

    console.log("\nSBS", subscription);

    const output = {
      subscription: {
        id: subscription.id,
        name: subscription.name,
        description: subscription.description,
      },
      userSubscriptions: userSubscriptions,
    };

    return output;
  } catch (err) {
    console.log("getUserSubscriptionDetails", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updateUserSubscription = async (userId, reqBody, req) => {
  try {
    const { user, dbInstance } = req;
    const { subscriptionId, featureId, autoRenew, autoRenewUnits } = reqBody;

    if (user.agent.agentType === AGENT_TYPE.STAFF) {
      return { error: true, message: "You do not have permission to update subscription." };
    } else if (!user || !dbInstance.user) {
      throw new Error("Invalid User.");
    }

    // update user subscription fields based on subscriptionId and featureId
    const userSubscription = await dbInstance.userSubscription.findOne({
      where: { userId: user.id, subscriptionId, featureId },
    });

    if (!userSubscription) {
      throw new Error(`No user subscription found for user ${user.id} and subscription ${subscriptionId}`);
    } else {
      userSubscription.autoRenew = autoRenew;
      userSubscription.autoRenewUnits = autoRenewUnits;
      await userSubscription.save();
    }

    return { success: true, message: "Subscription updated successfully." };
  } catch (e) {
    console.log("updateUserSubscription", e);
    return { error: true, generalError: "Server not responding, please try again later." };
  }
};

export const addSubscriptionFeatureToUser = async (userId, reqBody, req) => {
  try {
    const { dbInstance } = req;
    const { subscriptionId, featureId } = reqBody;

    const user = await dbInstance.user.findOne({ where: { id: userId } });

    if (user?.agent?.agentType === AGENT_TYPE.STAFF) {
      return { error: true, message: "You do not have permission to subscribe user." };
    }

    const subscription = addUserToFeatureSubscription(userId, subscriptionId, featureId, dbInstance);

    return subscription;
  } catch (err) {
    console.log("addSubscriptionFeatureToUser", err);
    return { error: true, message: "Server not responding, please try again later." };
  };
}

export const addUserToFeatureSubscription = async (userId, subscriptionId, featureId, dbInstance) => {
  try {
    const user = await dbInstance.user.findOne({ where: { id: userId } });
    if (!user) {
      return { error: true, message: "Invalid user id or user does not exist." };
    }

    const subscription = await dbInstance.subscription.findOne({ where: { id: subscriptionId } });
    if (!subscription) {
      return { error: true, message: "Invalid subscription id or subscription does not exist." };
    }

    const linkedFeaturesMap = {
      'Video Call': 'Property Listing',
      'Snag List': 'Property Listing',
      'Carbon Footprint': 'Video Call',
      'Video Call Recording': 'Video Call',
    };

    const feature = await dbInstance.feature.findOne({ where: { id: featureId } });
    if (!feature) {
      return { error: true, message: "Invalid feature id or feature does not exist." };
    }

    const linkedFeature = linkedFeaturesMap[feature.name];
    if (linkedFeature) {
      const linkedFeatureObject = await dbInstance.feature.findOne({ where: { name: linkedFeature } });
      if (!linkedFeatureObject) {
        return {
          error: true,
          message: `Unable to find "${linkedFeature}" feature, which is a pre-requisite for ${feature.name}.`,
        };
      }

      const existingLinkedSubscription = await dbInstance.userSubscription.findOne({
        where: {
          userId: user.id,
          subscriptionId: subscription.id,
          featureId: linkedFeatureObject.id,
        },
        include: {
          model: dbInstance.feature,
          as: 'feature',
        },
      });

      if (!existingLinkedSubscription) {
        return {
          error: true,
          message: `Cannot subscribe to "${feature.name}" without an active "${linkedFeature}" subscription.`,
        };
      }
    }

    // Check if the user is already subscribed to this feature
    const existingSubscription = await dbInstance.userSubscription.findOne({
      where: {
        userId: user.id,
        subscriptionId: subscription.id,
        featureId: feature.id
      }
    });

    let result;
    if (!existingSubscription) {
      const userSubscription = {
        userId: user.id,
        subscriptionId: subscription.id,
        featureId: feature.id,
        freeRemainingUnits: feature.freeUnits,
        paidRemainingUnits: 0,
        status: "active",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      if (userSubscription) {
        result = await dbInstance.userSubscription.create(userSubscription);
      }
    }

    return { success: true, message: "Subscription added successfully", data: result };
  } catch (err) {
    console.log("addUserToSubscription", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getUserTokens = async (userId, dbInstance, valid = true, available) => {
  try {

    if (!userId) {
      return { error: true, message: "User ID is required." };
    }

    const whereClause = {
      userId,
      valid,
      refundStatus: { [OP.or]: [null] },
      refundAmount: { [OP.or]: [null] }
    };

    if (available !== undefined) {
      whereClause.remainingAmount = available ? { [OP.gt]: 0 } : { [OP.gte]: 0 };
    }

    const tokens = await db.models.token.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
    });

    if (!tokens) {
      return { error: true, message: "Invalid user id or user does not exist." };
    }

    let totalTokens = 0,
      totalTokensUsed = 0,
      totalTokensRemaining = 0,
      pendingTokens = 0;
    tokens.forEach((token) => {
      if (token.valid) {
        totalTokens += token.quantity;
        totalTokensUsed += token.quantity - token.remainingAmount;
        totalTokensRemaining += token.remainingAmount;
      } else {
        pendingTokens += token.totalAmount;
      }
    });

    return {
      tokens,
      totalTokens,
      totalTokensUsed,
      totalTokensRemaining,
      pendingTokens,
    };
  } catch (err) {
    console.log("getUserTokensServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getUserTokenTransactions = async (userId, dbInstance) => {
  try {
    const tokenTransactions = await dbInstance.tokenTransaction.findAll({
      where: { userId },
      attributes: [
        "id",
        "userId",
        "featureId",
        "quantity",
        "description",
        "createdAt",
        "updatedAt",
        "createdBy",
        "updatedBy",
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!tokenTransactions) {
      return { error: true, message: "Invalid user id or user do not exist." };
    }

    return tokenTransactions;
  } catch (err) {
    console.log("getUserTokenTransactionsServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const createTokenTransaction = async (userId, reqBody, dbInstance) => {
  try {
    const { tokenId, quantity, description } = reqBody;

    let hasBalance = false;

    const token = await dbInstance.token.findOne({ where: { id: tokenId } });
    if (token.remainingAmount >= quantity) {
      hasBalance = true;
    }

    if (!hasBalance) {
      return { error: true, message: "Insufficient balance" };
    }

    const result = await db.transaction(async (transaction) => {
      const tokenTransaction = await dbInstance.tokenTransaction.create(
        {
          userId,
          tokenId,
          quantity,
          description,
        },
        { transaction }
      );

      const token = await dbInstance.token.findOne({ where: { id: tokenId } });
      token.remainingAmount -= quantity;
      await token.save({ transaction });

      // return tokenTransaction;
      return { success: true, message: "Token transaction created successfully.", tokenTransaction };
    });

    return result;
  } catch (err) {
    console.log("createTokenTransactionServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const createTokenTransactionMultiple = async (userId, reqBody, dbInstance) => {
  try {
    const { featureId, quantity, amount, description } = reqBody;

    const subscription = await db.models.subscription.findOne({
      where: { name: 'USEE360 Basic' },
    });

    const userSubscription = await dbInstance.userSubscription.findOne({
      where: { userId, subscriptionId: subscription.id, featureId },
    });
    if (!userSubscription) {
      return { error: true, message: "You are not subscribed to buy this feature." };
    }

    reqBody.available = true;
    const tokenTransactions = await getUserTokens(userId, dbInstance);
    if (tokenTransactions?.error) {
      return { error: true, message: "Invalid user id or user do not exist." };
    }

    if (tokenTransactions.totalTokensRemaining < amount) {
      return { error: true, message: "Insufficient balance" };
    }

    const results = await db.transaction(async (transaction) => {
      let balance = amount;
      let deductedAmount = 0;

      for (const token of tokenTransactions.tokens) {
        if (token.remainingAmount >= balance) {
          deductedAmount = balance;
          balance = 0;
        } else if (token.remainingAmount < balance) {
          deductedAmount = token.remainingAmount;
          balance -= token.remainingAmount;
        } else {
          // 
        }

        token.remainingAmount -= deductedAmount;
        await token.save({ transaction: transaction });
      }

      let createdTransaction = await dbInstance.tokenTransaction.create(
        {
          userId,
          featureId,
          quantity,
          amount,
          description,
          createdBy: userId,
          updatedBy: userId,
        },
        { transaction: transaction }
      );

      return { success: true, message: "Token transactions created successfully.", createdTransaction };
    });

    if (results?.success) {
      if (userSubscription) {
        userSubscription.paidRemainingUnits += quantity;
        await userSubscription.save();
      }
    }

    return results;
  } catch (err) {
    console.log("createTokenTransactionMultipleServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const createTokenTransactionMultiple2 = async (userId, reqBody, transaction) => {
  try {
    const { featureId, quantity, amount, description } = reqBody;

    const subscription = await db.models.subscription.findOne({
      where: { name: 'USEE360 Basic' },
    });

    const userSubscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId: subscription.id, featureId },
    });

    if (!userSubscription) {
      return { error: true, message: "You are not subscribed to buy this feature." };
    }

    reqBody.available = true;
    const tokens = await getUserTokens(userId, db);

    if (tokens?.error) {
      return { error: true, message: "Invalid user id or user do not exist." };
    }

    if (tokens.totalTokensRemaining < quantity) {
      return { error: true, message: "Insufficient balance" };
    }

    let balance = amount;
    let deductedAmount = 0;

    for (const token of tokens.tokens) {
      if (token.remainingAmount >= balance) {
        deductedAmount = balance;
        balance = 0;
      } else if (token.remainingAmount < balance) {
        deductedAmount = token.remainingAmount;
        balance -= token.remainingAmount;
      } else {
        // 
      }

      token.remainingAmount -= deductedAmount;
      await token.save({ transaction });
    }

    let createdTransaction = await db.models.tokenTransaction.create({
      userId,
      featureId,
      quantity,
      amount,
      description,
      createdBy: userId,
      updatedBy: userId,
    }, { transaction: transaction });

    return { success: true, message: "Token transactions created successfully.", createdTransaction };
  } catch (err) {
    console.error("createTokenTransactionMultipleServiceError", err);
    await transaction.abort();
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const purchaseTokensWithStripe = async (user, userSubscription, quantity, price, transaction) => {
  try {
    const { stripeCustomerId } = user;
    if (!stripeCustomerId) {
      throw new Error('User does not have a Stripe customer ID');
    }

    // Create an invoice for the customer
    const invoice = await stripe.invoices.create({
      customer: stripeCustomerId,
      auto_advance: true,
      collection_method: 'charge_automatically',
      metadata: {
        subscriptionId: userSubscription.id,
        description: `Used for renewing ${userSubscription.feature.name}`
      }
    });

    // Create an invoice item for the product
    // eslint-disable-next-line no-unused-vars
    const invoiceItem = await stripe.invoiceItems.create({
      customer: stripeCustomerId,
      invoice: invoice.id,
      price: price.stripePriceId,
      quantity,
    });

    // eslint-disable-next-line no-unused-vars
    const invoicePaid = await stripe.invoices.pay(invoice.id);

    // Add the tokens to the user's account in your database
    const token = await db.models.token.create({
      userId: user.id,
      quantity: quantity,
      price: price.configValue,
      totalAmount: price.configValue * quantity,
      remainingAmount: quantity,
      stripeInvoiceId: invoice.id,
      stripeInvoiceStatus: invoice.status,
    }, { transaction: transaction });

    if (invoicePaid.status !== 'paid') {
      throw new Error('Invoice created with pending payment');
    }

    console.log('Successfully purchased tokens auto-renewed successfully for %s : %s', userSubscription.feature.name, token);
    return { success: true, message: "Purchased tokens successfully for stripe." };
  } catch (error) {
    console.error('Error purchasing tokens with Stripe:', error);
    throw error;
  }
}
