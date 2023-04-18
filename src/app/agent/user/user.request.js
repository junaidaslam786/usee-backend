import { body } from 'express-validator';
import db from '@/database';

export const createAgentUserRules = [
  body('firstName').exists().notEmpty(),
  body('lastName').exists().notEmpty(),
  body('phoneNumber').exists().notEmpty(),
  body('role').exists().notEmpty(),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then(emailData => {
      if (emailData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('branch').exists().custom(async (value) => {
    return await db.models.agentBranch.findOne({ where: { id: value } }).then(agentBranchData => {
      if (!agentBranchData) {
        return Promise.reject('Invalid branch id or branch do not exist.');
      }
    });
  }),
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

export const checkAvailabilityRules = [
  body('date').exists().withMessage('date is not provided').notEmpty().withMessage('date should not be empty'),
  body('time').exists().withMessage('time is not provided').notEmpty().withMessage('time should not be empty'),
];

export const createAgentSupervisorRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
  body('email').isEmail().withMessage('Please provide valid email').exists().withMessage('Please provide email').custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then(emailData => {
      if (emailData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
];

export const updateAgentSupervisorRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
  body('id').exists().withMessage('Please provide supervisor id').custom(async (value) => {
    return await db.models.agent.findOne({ where: { userId: value } }).then(emailData => {
      if (!emailData) {
        return Promise.reject('Supervisor does not exist.');
      }
    });
  }),
];
