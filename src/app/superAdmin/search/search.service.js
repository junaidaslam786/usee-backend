import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";
import { calculateDistance, calculateTime } from "@/helpers/googleMapHelper";

const { Op } = Sequelize;

const {
  appointment,
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

export async function searchAll(req, res) {
  // const { startDate, endDate, startMeetingTime, endMeetingTime, search, page, limit } = req.query;

  try {
    const appointmentResults = await searchAppointments(req, res);
    const propertyResults = await searchProperties(req, res);
    const userResults = await searchUsers(req, res);

    return {
      appointments: appointmentResults?.appointments,
      properties: propertyResults?.properties,
      users: userResults?.users
    };
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


export async function searchAppointments(req, res) {
  const { startDate, endDate, startMeetingTime, endMeetingTime, search, page, limit } = req.query;

  try {
    const whereClauseAppointment = {};

    if (startDate && endDate) {
      whereClauseAppointment.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (startMeetingTime && endMeetingTime) {
      whereClauseAppointment.startMeetingTime = {
        [Op.between]: [startMeetingTime],
      };
      whereClauseAppointment.endMeetingTime = {
        [Op.between]: [endMeetingTime],
      };
    }

    if (search) {
      whereClauseAppointment[Op.or] = [
        {
          status: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const appointments = await appointment.findAll({
      whereClauseAppointment,
    });

    return {appointments: appointments};
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function searchProperties(req, res) {
  const { startDate, endDate, startMeetingTime, endMeetingTime, search, page, limit } = req.query;

  try {
    const whereClauseProperties = {};

    if (startDate && endDate) {
      whereClauseProperties.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (search) {
      whereClauseProperties[Op.or] = [
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

    const properties = await product.findAll({
      whereClauseProperties,
    });

    return {properties: properties};
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function searchUsers(req, res) {
  const { startDate, endDate, startMeetingTime, endMeetingTime, search, page, limit } = req.query;

  try {
    const whereClauseUser = {};

    if (search) {
      whereClauseUser[Op.or] = [
        {
          status: {
            [Op.iLike]: `%${search}%`,
          },
        },
      ];
    }

    const users = await user.findAll({
      whereClauseUser,
    });

    return {users: users};
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
