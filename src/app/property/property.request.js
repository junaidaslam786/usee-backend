import { body } from 'express-validator';
import db from '@/database';

export const removalRequestRules = [
  body('propertyId').exists().notEmpty(),
  body('reasonId').exists().custom(async (value) => {
    return await db.models.productRemoveReason.findOne({ where: { id: value } }).then(reasonData => {
      if (!reasonData) {
        return Promise.reject('Invalid reason id or reason do not exist.');
      }
    });
  }), 
];

export const createPropertyRules = [
  body('title').exists().notEmpty(),
  body('address').exists().notEmpty(),
  body('city').exists().notEmpty(),
  body('postalCode').exists().notEmpty(), 
  body('region').exists().notEmpty(), 
];

export const updatePropertyRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
  body('title').exists().notEmpty(),
  body('address').exists().notEmpty(),
  body('city').exists().notEmpty(),
  body('region').exists().notEmpty(), 
];

export const uploadPropertyDocumentRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
  body('titles').exists().notEmpty(),
];

export const uploadPropertyImageRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
];

export const deletePropertyDocumentRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
  body('documentId').exists().custom(async (value) => {
    return await db.models.productDocument.findOne({ where: { id: value } }).then(productDocumentData => {
      if (!productDocumentData) {
        return Promise.reject('Invalid document id or document do not exist.');
      }
    });
  }), 
];

export const deletePropertyImageRules = [
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
  body('imageId').exists().custom(async (value) => {
    return await db.models.productImage.findOne({ where: { id: value } }).then(productImageData => {
      if (!productImageData) {
        return Promise.reject('Invalid image id or image do not exist.');
      }
    });
  }), 
];