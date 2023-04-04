import { body } from 'express-validator';
import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const createAgentBranchRules = [
  body('name').exists().custom(async (value, { req }) => {
    return await db.models.agentBranch.findOne({ where: { name: value, userId: req.user.id } }).then(agentBranchData => {
      if (agentBranchData) {
        return Promise.reject('Branch name already exist.');
      }
    });
  }),
];

export const updateAgentBranchRules = [
  body('branchId').exists().custom(async (value) => {
    return await db.models.agentBranch.findOne({ where: { id: value } }).then(agentUserData => {
      if (!agentUserData) {
        return Promise.reject('Invalid branch id or branch do not exist.');
      }
    });
  }),
  body('name').exists().custom(async (value, { req }) => {
    return await db.models.agentBranch.findOne({ where: { name: value, userId: req.user.id, id: { [OP.ne]: req.body.branchId } } }).then(agentBranchData => {
      if (agentBranchData) {
        return Promise.reject('Branch name already exist.');
      }
    });
  }),
];