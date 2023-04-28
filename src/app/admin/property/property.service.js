import { PRODUCT_STATUS } from '@/config/constants';
import { Op } from 'sequelize';

export const listProperties = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.product.findAndCountAll({
      include: [
        {
          model: dbInstance.user,
          as: 'user',
          where: { deletedAt: null },
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },
      ],

      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listPropertiesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const listPropertyRemovalRequest = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.productRemoveRequest.findAndCountAll({
      where: { status: { [Op.eq]: false } },

      include: [
        {
          model: dbInstance.product,
          as: 'product',
          include: [
            {
              model: dbInstance.user,
              as: 'user',
              where: { deletedAt: null },
              attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
            },
          ],
        },

      ],

      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listPropertiesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const getPropertyById = async (propertyId, dbInstance) => {
  const property = await dbInstance.productRemoveRequest.findOne({
    where: { productId: propertyId },
    include: [
      {
        model: dbInstance.product,
        as: 'product',
        attributes: ['title', 'status'],
      },
    ],
  });
  if (!property) {
    return false;
  }

  return property;
};

export const approvePropertyRemovalRequest = async (reqBody, dbInstance) => {
  try {
    const { propertyId, reasonId } = reqBody;

    const property = await getPropertyById(propertyId, dbInstance);
    if (!property) {
      return { error: true, message: 'Invalid property id or Property do not exist.' };
    }
    property.status = true;
    property.product.status = PRODUCT_STATUS.REMOVED;

    await property.save();
    return true;
  } catch (err) {
    console.log('approvePropertyRemovalServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
