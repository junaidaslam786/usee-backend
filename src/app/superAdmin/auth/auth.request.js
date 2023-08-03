/* eslint-disable no-self-compare */
/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
import { body, check } from 'express-validator';
import db from '@/database';

export const loginRules = [
  body('email').isEmail().withMessage('Please provide valid email address').exists()
    .withMessage('Please provide email address'),
  body('password').exists().withMessage('Please provide password'),
];

export const registerSuperAdminRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('email').isEmail().exists().custom(async (value) => await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then((userData) => {
    if (userData) {
      return Promise.reject('Email address already exist.');
    }
  })),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 digits').exists()
    .withMessage('Enter password to register'),
  body('confirmPassword').custom((value, { req }) => {
    console.log('body')
    if (value !== req.body.password) {
      throw new Error('Password and confirm password should match');
    }
    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

export const registerAgentRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('companyName').exists().withMessage('Please provide company name').notEmpty()
    .withMessage('Please provide company name'),
  body('companyPosition').exists().withMessage('Please provide company position').notEmpty()
    .withMessage('Please provide company position'),
  body('phoneNumber').exists().withMessage('Please provide phone number').notEmpty()
    .withMessage('Please provide phone number'),
  body('email').isEmail().exists().custom(async (value) => await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then((userData) => {
    if (userData) {
      return Promise.reject('Email address already exist.');
    }
  })),
];

export const registerCustomerRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('email').isEmail().exists().custom(async (value) => await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then((userData) => {
    if (userData) {
      return Promise.reject('Email address already exist.');
    }
  })),
];

export const forgotPasswordRules = [
  check('email').exists().withMessage('Please provide email address').notEmpty()
    .withMessage('Please provide email address')
    .isEmail()
    .withMessage('Please provide valid email address'),
];

export const resetPasswordRules = [
  body('token').exists().withMessage('Please provide token').notEmpty()
    .withMessage('Please provide token'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 digits').exists()
    .withMessage('Please provide password'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];
