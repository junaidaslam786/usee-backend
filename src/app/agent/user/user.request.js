import { body } from 'express-validator';
import db from '@/database';

export const createAgentUserRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('role').exists().notEmpty().withMessage('Please provide user access level')
    .custom((value, { req }) => {
      const accessLevels = Object.keys(req.body).filter(key => key.startsWith('accessLevels['));
      if (accessLevels.length === 0) {
        throw new Error('At least one access level is required for sub-agent users');
      }
      return true;
    }),
  body('email').isEmail().withMessage('Please provide valid email').exists()
    .withMessage('Please provide email')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line no-return-await, consistent-return
      return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then((emailData) => {
        if (emailData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Email address already exist.');
        }
      });
    }),
  body('phoneNumber')
    .exists().withMessage('Please provide phone number')
    .notEmpty()
    .withMessage('Please provide phone number')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line no-return-await, consistent-return
      return await db.models.user.findOne({ where: { phoneNumber: value } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Phone number already exist.');
        }
      });
    }),
  // body('branch').exists().custom(async (value) => {
  //   return await db.models.agentBranch.findOne({ where: { id: value } }).then(agentBranchData => {
  //     if (!agentBranchData) {
  //       return Promise.reject('Invalid branch id or branch do not exist.');
  //     }
  //   });
  // }),
];

export const updateAgentUserRules = [
  // eslint-disable-next-line arrow-body-style
  body('userId').exists().custom(async (value) => {
    // eslint-disable-next-line no-return-await, consistent-return
    return await db.models.user.findOne({ where: { id: value } }).then((agentUserData) => {
      if (!agentUserData) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
  body('role').exists().withMessage('Please provide user role').notEmpty()
    .withMessage('Please provide user role'),
];

export const updateAgentUserBranchRules = [
  // eslint-disable-next-line arrow-body-style
  body('userId').exists().custom(async (value) => {
    // eslint-disable-next-line no-return-await, consistent-return
    return await db.models.user.findOne({ where: { id: value } }).then((agentUserData) => {
      if (!agentUserData) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
  // eslint-disable-next-line arrow-body-style
  body('branchId').exists().custom(async (value) => {
    // eslint-disable-next-line no-return-await, consistent-return
    return await db.models.agentBranch.findOne({ where: { id: value } }).then((agentBranchData) => {
      if (!agentBranchData) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid branch id or branch do not exist.');
      }
    });
  }),
];

export const updateAgentUserSortingRules = [
  // eslint-disable-next-line arrow-body-style
  body('userId').exists().custom(async (value) => {
    // eslint-disable-next-line no-return-await, consistent-return
    return await db.models.user.findOne({ where: { id: value } }).then((agentUserData) => {
      if (!agentUserData) {
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
  body('sort').exists().notEmpty(),
];

export const createTokenTransactionRules = [
  body('quantity')
    .exists()
    .withMessage('Please provide quantity')
    .isNumeric()
    .withMessage('Quantity must be a number')
    .custom((value) => {
      if (Number(value) <= 0) {
        throw new Error('Quantity must be greater than zero');
      }
      return true;
    }),
];
