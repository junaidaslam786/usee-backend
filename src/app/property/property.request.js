import { body } from 'express-validator';
import db from '@/database';

export const removalRequestRules = [
  body('propertyId').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('reasonId').exists().custom(async (value) => {
    return await db.models.productRemoveReason.findOne({ where: { id: value } }).then(reasonData => {
      if (!reasonData) {
        return Promise.reject('Invalid reason id or reason do not exist.');
      }
    });
  }), 
];

export const customerOfferRequestRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('amount').exists().withMessage('Please provide amount').notEmpty().withMessage('Please provide amount'),
  body('notes').optional(),
];

export const updateOfferStatusRequestRules = [
  body('offerId').exists().withMessage('Please provide offer id').notEmpty().withMessage('Please provide offer id'),
  body('status').exists().withMessage('Please provide status').notEmpty().withMessage('Please provide status'),
  body('rejectReason').optional(),
];

export const createPropertyRules = [
  body('title').exists().withMessage('Please provide property title').notEmpty().withMessage('Please provide property title'),
  body('description').exists().withMessage('Please provide property description').notEmpty().withMessage('Please provide property description'),
  body('price').exists().withMessage('Please provide property price').notEmpty().withMessage('Please provide property price'),
  body('address').exists().withMessage('Please provide property address').notEmpty().withMessage('Please provide property address'),
  body('city').exists().withMessage('Please provide property city').notEmpty().withMessage('Please provide property city'),
  body('postalCode').exists().withMessage('Please provide property postal code').notEmpty().withMessage('Please provide property postal code'),
  body('region').exists().withMessage('Please provide property region').notEmpty().withMessage('Please provide property region'),
  body('latitude').exists().withMessage('Please provide property latitude').notEmpty().withMessage('Please provide property latitude'),
  body('longitude').exists().withMessage('Please provide property longitude').notEmpty().withMessage('Please provide property longitude'),
  body('virtualTourType').exists().withMessage('Please provide property virtual tour type').notEmpty().withMessage('Please provide property virtual tour type'),
];

export const updatePropertyRules = [
  body('id').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('title').optional(),
  body('description').optional(),
  body('price').optional(),
  body('address').optional(),
  body('city').optional(),
  body('postalCode').optional(),
  body('region').optional(),
  body('latitude').optional(),
  body('longitude').optional(),
  body('virtualTourType').optional(),
];

export const uploadPropertyDocumentRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('titles').exists().withMessage('Please provide titles').notEmpty().withMessage('Please provide titles'),
  body('files').exists().withMessage('Please provide document files').notEmpty().withMessage('Please provide document files'),
];

export const deletePropertyDocumentRules = [
  body('id').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('documentId').exists().withMessage('Please provide document id').notEmpty().withMessage('Please provide document id'),
];

export const uploadPropertyImageRules = [
  body('id').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('image').exists().withMessage('Please provide image').notEmpty().withMessage('Please provide image'),
];

export const addPropertyLogRules = [
  body('id').exists().withMessage('Please provide property id').notEmpty().withMessage('Please provide property id'),
  body('logType').exists().withMessage('Please provide log').notEmpty().withMessage('Please provide log'),
];
