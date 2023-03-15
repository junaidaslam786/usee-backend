import { body } from 'express-validator';
import db from '@/database';

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

export const createPropertyRules = [
  body('title').exists(), 
  body('address').exists(), 
  body('city').exists(), 
  body('postalCode').exists(), 
  body('region').exists(), 
];

export const uploadPropertyDocumentRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(reasonData => {
      if (!reasonData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
  body('titles').exists(), 
];

export const uploadPropertyImageRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(reasonData => {
      if (!reasonData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
];