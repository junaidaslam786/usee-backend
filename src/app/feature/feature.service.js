import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import {
  PRODUCT_STATUS,
  PRODUCT_CATEGORIES,
  PROPERTY_ROOT_PATHS,
  VIRTUAL_TOUR_TYPE,
  USER_ALERT_MODE,
  USER_ALERT_TYPE,
  OFFER_STATUS,
  EMAIL_SUBJECT,
  EMAIL_TEMPLATE_PATH,
  PRODUCT_LOG_TYPE,
  AGENT_TYPE,
  AGENT_USER_ACCESS_TYPE_VALUE
} from '../../config/constants';
import { utilsHelper, mailHelper } from '@/helpers';
import db from '@/database';
import * as userService from '../user/user.service'
const path = require("path")
const ejs = require("ejs");
import { calculateDistance } from '@/helpers/utils';

export const getAllFeatures = async (body, req) => {
  try {
    const { limit, offset, categoryId, search, status, propertyId, userId } = body;
    const { user, dbInstance } = req;
    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.name = { [OP.like]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }
    if (propertyId) {
      where.propertyId = propertyId;
    }
    if (userId) {
      where.userId = userId;
    }

    console.log('dbInstance', dbInstance);
    const features = await dbInstance.feature.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: dbInstance.productCategory,
          as: 'category',
          attributes: ['id', 'name', 'description', 'status'],
          required: false,
        },
        {
          model: dbInstance.property,
          as: 'property',
          attributes: ['id', 'name', 'description', 'status'],
          required: false,
        },
        {
          model: dbInstance.user,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'status'],
          required: false,
        },
      ],
    });
    return features;
  } catch (error) {
    throw error;
  }
}