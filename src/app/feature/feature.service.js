/* eslint-disable import/prefer-default-export */
import { Op } from 'sequelize';

export const getAllFeatures = async (body, req) => {
  try {
    const {
      limit,
      offset,
      categoryId,
      search,
      status,
      propertyId,
      userId,
    } = body;
    const { dbInstance } = req;
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
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

    const { count, rows } = await dbInstance.feature.findAndCountAll({
      where,
      limit,
      offset,
      order: [['order', 'ASC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (e) {
    console.log('updateUserSubscription', e);
    return { error: true, generalError: 'Server not responding, please try again later.' };
  }
};
