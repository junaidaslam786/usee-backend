/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
import { body } from 'express-validator';
import db from '@/database';

export const removalRequestRules = [
  body('propertyId').exists().withMessage('Please provide property id').notEmpty()
    .withMessage('Please provide property id'),
  body('reasonId').exists().custom(async (value) => await db.models.productRemoveReason.findOne({ where: { id: value } }).then((reasonData) => {
    if (!reasonData) {
      return Promise.reject('Invalid reason id or reason do not exist.');
    }
  })),
];

export const createPropertyRules = [
  body('title').exists().withMessage('Please provide title').notEmpty()
    .withMessage('Please provide title'),
  body('address').exists().withMessage('Please provide address').notEmpty()
    .withMessage('Please provide address'),
  body('city').exists().withMessage('Please provide city').notEmpty()
    .withMessage('Please provide city'),
  body('region').exists().withMessage('Please provide region').notEmpty()
    .withMessage('Please provide region'),
];

export const updatePropertyRules = [
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } }).then((productData) => {
    if (!productData) {
      return Promise.reject('Invalid product id or product do not exist.');
    }
  })),
  body('title').exists().withMessage('Please provide title').notEmpty()
    .withMessage('Please provide title'),
  body('address').exists().withMessage('Please provide address').notEmpty()
    .withMessage('Please provide address'),
  body('city').exists().withMessage('Please provide city').notEmpty()
    .withMessage('Please provide city'),
  body('region').exists().withMessage('Please provide region').notEmpty()
    .withMessage('Please provide region'),
];

export const uploadPropertyDocumentRules = [
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } }).then((productData) => {
    if (!productData) {
      return Promise.reject('Invalid product id or product do not exist.');
    }
  })),
  body('titles').exists().withMessage('Please provide document title').notEmpty()
    .withMessage('Please provide document title'),
];

export const uploadPropertyImageRules = [
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } }).then((productData) => {
    if (!productData) {
      return Promise.reject('Invalid product id or product do not exist.');
    }
  })),
];

export const deletePropertyDocumentRules = [
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } }).then((productData) => {
    if (!productData) {
      return Promise.reject('Invalid product id or product do not exist.');
    }
  })),
  body('documentId').exists().custom(async (value) => await db.models.productDocument.findOne({ where: { id: value } }).then((productDocumentData) => {
    if (!productDocumentData) {
      return Promise.reject('Invalid document id or document do not exist.');
    }
  })),
];

export const deletePropertyImageRules = [
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } }).then((productData) => {
    if (!productData) {
      return Promise.reject('Invalid product id or product do not exist.');
    }
  })),
  body('imageId').exists().custom(async (value) => await db.models.productImage.findOne({ where: { id: value } }).then((productImageData) => {
    if (!productImageData) {
      return Promise.reject('Invalid image id or image do not exist.');
    }
  })),
];

export const customerOfferRequestRules = [
  body('productId').exists().custom(async (value) => await db.models.product.findOne({ where: { id: value } }).then((productData) => {
    if (!productData) {
      return Promise.reject('Invalid product id or product do not exist.');
    }
  })),
  body('amount').exists().withMessage('Please provide amount').notEmpty()
    .withMessage('Please provide amount'),
];

export const updateOfferStatusRequestRules = [
  body('offerId').exists().withMessage('Please provide offer id').notEmpty()
    .withMessage('Please provide offer id'),
  body('status').exists().withMessage('Please provide status').notEmpty()
    .withMessage('Please provide status'),
];
