import { body, check } from 'express-validator';
import db from '@/database';

export const loginRules = [
  body('email').isEmail().exists(),
  body('password').exists(),
];

export const registerAgentRules = [
  body('firstName').exists(),
  body('lastName').exists(),
  body('companyName').exists(),
  body('companyPosition').exists(),
  body('phoneNumber').exists(),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('password').isLength({ min: 8 }).exists(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

export const registerCustomerRules = [
  body('firstName').exists(),
  body('lastName').exists(),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('password').isLength({ min: 8 }).exists(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
]

export const forgotPasswordRules = [
  check('email').isEmail().exists()
];

export const resetPasswordRules = [
  body('token').exists(),
  body('email').isEmail().exists(),
  body('password').isLength({ min: 6 }).exists(),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];