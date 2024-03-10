import { body } from 'express-validator';
import db from '@/database';

// eslint-disable-next-line import/prefer-default-export
export const createCustomerAlertRules = [
  // eslint-disable-next-line no-return-await
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } })
    .then((productData) => {
      if (!productData) {
        throw new Error('Invalid property id or property do not exist.');
      }
    })),
  body('alertMode').exists(),
  body('alertType').exists(),
];
