/* eslint-disable max-len */
/* eslint-disable no-return-await */
/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */

import { body } from 'express-validator';
import db from '@/database';
import { Sequelize } from 'sequelize';

const OP = Sequelize.Op;

export const createRoleRules = [
  body('name').exists().custom(async (value) => await db.models.role.findOne({ where: { name: value } }).then((roleData) => {
    if (roleData) {
      return Promise.reject('Role with this name already exist, choose different name.');
    }
  })),
  body('permissions').exists().notEmpty(),
];

export const updateRoleRules = [
  body('id').exists().notEmpty(),
  body('name').exists().custom(async (value, { req }) => await db.models.role.findOne({ where: { name: value, id: { [OP.ne]: req.body.id } } }).then((roleData) => {
    if (roleData) {
      return Promise.reject('Role with this name already exist, choose different name.');
    }
  })),
  body('permissions').exists().notEmpty(),
];
