import { body } from 'express-validator';
import db from '@/database';

export const createAgentUserRules = [
  body('firstName').exists(),
  body('lastName').exists(),
  body('phoneNumber').exists(),
  body('role').exists(),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value } }).then(emailData => {
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
  body('sort').exists(),
];