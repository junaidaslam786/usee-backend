import { body } from 'express-validator';
import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const createRoleRules = [
    body('name').exists().custom(async (value) => {
        return await db.models.role.findOne({ where: { name: value } }).then(roleData => {
          if (roleData) {
            return Promise.reject('Role with this name already exist, choose different name.');
          }
        });
    }), 
    body('permissions').exists(), 
];

export const updateRoleRules = [
    body('id').exists(), 
    body('name').exists().custom(async (value, { req }) => {
        return await db.models.role.findOne({ where: { name: value, id: { [OP.ne]: req.body.id } } }).then(roleData => {
          if (roleData) {
            return Promise.reject('Role with this name already exist, choose different name.');
          }
        });
    }), 
    body('permissions').exists(), 
];