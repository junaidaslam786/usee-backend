import { body } from 'express-validator';
import db from '@/database';
import { Sequelize } from 'sequelize';

export const removalRequestRules = [
  body('propertyId').exists(), 
  body('reasonId').exists().custom(async (value) => {
    return await db.models.productRemoveReason.findOne({ where: { id: value } }).then(reasonData => {
      if (!reasonData) {
        return Promise.reject('Invalid reason id or reason do not exist.');
      }
    });
  }), 
];