import { body } from 'express-validator';
import db from '@/database';

export const createAgentUserRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
  body('phoneNumber').exists().withMessage('Please provide phone number').notEmpty().withMessage('Please provide phone number'),
  body('role').exists().withMessage('Please provide user role').notEmpty().withMessage('Please provide user role'),
  body('email').isEmail().withMessage('Please provide valid email').exists().withMessage('Please provide email').custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then(emailData => {
      if (emailData) {
        return Promise.reject('Email address already exist.');
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
  body('userId').exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { id: value } }).then(agentUserData => {
      if (!agentUserData) {
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
  body('role').exists().withMessage('Please provide user role').notEmpty().withMessage('Please provide user role'),
];

export const updateAgentUserBranchRules = [
  body('userId').exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { id: value } }).then(agentUserData => {
      if (!agentUserData) {
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
  body('branchId').exists().custom(async (value) => {
    return await db.models.agentBranch.findOne({ where: { id: value } }).then(agentBranchData => {
      if (!agentBranchData) {
        return Promise.reject('Invalid branch id or branch do not exist.');
      }
    });
  }),
];

export const updateAgentUserSortingRules = [
  body('userId').exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { id: value } }).then(agentUserData => {
      if (!agentUserData) {
        return Promise.reject('Invalid user id or user do not exist.');
      }
    });
  }),
  body('sort').exists().notEmpty(),
];
