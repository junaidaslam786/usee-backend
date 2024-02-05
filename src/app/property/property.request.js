import { body } from 'express-validator';
import db from '@/database';

export const removalRequestRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  // eslint-disable-next-line arrow-body-style
  body('reasonId').exists().custom(async (value) => {
    // eslint-disable-next-line no-return-await, consistent-return
    return await db.models.productRemoveReason.findOne({ where: { id: value } }).then((reasonData) => {
      if (!reasonData) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid reason id or reason do not exist.');
      }
    });
  }),
];

export const customerOfferRequestRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('amount').exists().withMessage('Please provide amount').notEmpty()
    .withMessage('Please provide amount'),
  body('notes').optional(),
];

export const updateOfferStatusRequestRules = [
  body('offerId').exists().withMessage('Please provide offer id').notEmpty()
    .withMessage('Please provide offer id'),
  body('status').exists().withMessage('Please provide status').notEmpty()
    .withMessage('Please provide status'),
  body('rejectReason').optional(),
];

export const createPropertyRules = [
  body('title').exists().withMessage('Please provide property title').notEmpty()
    .withMessage('Please provide property title'),
  body('description').exists().withMessage('Please provide property description').notEmpty()
    .withMessage('Please provide property description'),
  body('price').exists().withMessage('Please provide property price').notEmpty()
    .withMessage('Please provide property price'),
  body('address').exists().withMessage('Please provide property address').notEmpty()
    .withMessage('Please provide property address'),
  body('city').exists().withMessage('Please provide property city').notEmpty()
    .withMessage('Please provide property city'),
  body('permitNumber')
    .custom((value, { req }) => {
      if (req.body.region === 'United Arab Emirates' && req.body.city === 'Dubai') {
        if (!value) {
          throw new Error('Please provide permit number');
        } else if (value.trim() === '') {
          throw new Error('Permit number cannot be empty');
        }
      }
      return true;
    }),
  body('qrCode')
    .custom((value, { req }) => {
      if (req.body.region === 'United Arab Emirates' && req.body.city === 'Dubai') {
        if (!req.files || !req.files.qrCode) {
          throw new Error('Please provide QR code');
        }
      }
      return true;
    }),
  body('postalCode').exists().withMessage('Please provide property postal code').notEmpty()
    .withMessage('Please provide property postal code'),
  body('region').exists().withMessage('Please provide property region').notEmpty()
    .withMessage('Please provide property region'),
  body('latitude').exists().withMessage('Please provide property latitude').notEmpty()
    .withMessage('Please provide property latitude'),
  body('longitude').exists().withMessage('Please provide property longitude').notEmpty()
    .withMessage('Please provide property longitude'),
];

export const updatePropertyRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('title').optional(),
  body('description').optional(),
  body('price').optional(),
  body('address').optional(),
  body('city').optional(),
  body('country').optional(),
  body('permitNumber').optional(),
  body('postalCode').optional(),
  body('region').optional(),
  body('latitude').optional(),
  body('longitude').optional(),
  body('virtualTourType').optional(),
];

export const uploadPropertyDocumentRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('titles').exists().withMessage('Please provide titles').notEmpty()
    .withMessage('Please provide titles'),
];

export const deletePropertyDocumentRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('documentId').exists().withMessage('Please provide document id').notEmpty()
    .withMessage('Please provide document id'),
];

export const uploadPropertyImageRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  // body('image').exists().withMessage('Please provide image').notEmpty().withMessage('Please provide image'),
];

export const addPropertyLogRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('logType').exists().withMessage('Please provide log').notEmpty()
    .withMessage('Please provide log'),
];

export const deletePropertyImageRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('imageId').exists().withMessage('Please provide image id').notEmpty()
    .withMessage('Please provide image id'),
];

export const uploadFeaturedImageRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('featuredImage')
    .custom((value, { req }) => {
      if (!req.files || !req.files.featuredImage) {
        throw new Error('Please provide featured image file');
      }
      return true;
    }),
];

export const uploadVirtualTourRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('virtualTourType').exists().withMessage('Please provide virtual tour type').notEmpty()
    .withMessage('Please provide virtual tour type')
    .custom((value, { req }) => {
      if (value === 'url') {
        if (!req.body.virtualTourUrl) {
          throw new Error('Please provide virtual tour url');
        }
      } else if (value === 'video') {
        if (!req.files || !req.files.virtualTourVideo) {
          throw new Error('Please provide virtual tour video');
        }
      }
      return true;
    }),
];

export const uploadQrCodeRules = [
  body('productId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('qrCode')
    .custom((value, { req }) => {
      if (!req.files || !req.files.qrCode) {
        throw new Error('Please provide QR code file');
      }
      return true;
    }),
];
