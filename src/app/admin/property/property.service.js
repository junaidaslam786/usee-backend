import { Sequelize } from 'sequelize';
import { PRODUCT_STATUS } from '../../../config/constants';
import * as userService from '../../user/user.service';

export const listProperties = async (userId, reqBody, dbInstance) => {
  try {
    const status = (reqBody && reqBody.status) ? reqBody.status : PRODUCT_STATUS.ACTIVE;

    const { count, rows } = await dbInstance.product.findAndCountAll({
      where: { status },
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
    console.log('listActivePropertiesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};
