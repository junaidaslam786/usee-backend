import { body, check } from 'express-validator';
import db from '@/database';

export const loginRules = [
  body('email').isEmail().exists(),
  body('password').exists(),
];

export const registerAgentRules = [
  body('firstName').exists().notEmpty(),
  body('lastName').exists().notEmpty(),
  body('companyName').exists().notEmpty(),
  body('companyPosition').exists().notEmpty(),
  body('phoneNumber').exists().notEmpty(),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('password').isLength({ min: 8 }).exists().notEmpty(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

export const registerCustomerRules = [
  body('firstName').exists().notEmpty(),
  body('lastName').exists().notEmpty(),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 digits').exists().withMessage('Enter password to register'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
]

export const forgotPasswordRules = [
  check('email').isEmail().exists().notEmpty(),
];

export const resetPasswordRules = [
  body('token').exists().notEmpty(),
  body('email').isEmail().exists().notEmpty(),
  body('password').isLength({ min: 6 }).exists(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];