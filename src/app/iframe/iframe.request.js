import { body } from 'express-validator';
import db from '@/database';

export const addToWishlistRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid property id or property do not exist.');
      }
    });
  }), 
]

export const addAppointmentRules = [
  body('appointmentDate').exists().withMessage('Please provide date').notEmpty().withMessage('Please provide date'),
  body('timeSlotId').exists().withMessage('Please provide slot').notEmpty().withMessage('Please provide slot'),
  body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid property id or property do not exist.');
      }
    });
  }), 
]

export const checkAvailabilityRules = [
  body('date').exists().withMessage('date is not provided').notEmpty().withMessage('date should not be empty'),
  body('time').exists().withMessage('time is not provided').notEmpty().withMessage('time should not be empty'),
  body('userId').exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { id: value } }).then(agentUserData => {
      if (!agentUserData) {
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
];