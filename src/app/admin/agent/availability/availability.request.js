import { body } from 'express-validator';
import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const updateAgentAvailabilityRules = [
    body('userId').exists().custom(async (value) => {
        return await db.models.user.findOne({ where: { id: value } }).then(agentUserData => {
            if (!agentUserData) {
            return Promise.reject('Invalid user id or user do not exist.');
            }
        });
    }),
    body('allAvailable').isBoolean().exists(),
    body('slotDay').if((value, { req }) => !req.body.allAvailable).exists().notEmpty(),
    body('timeSlots').if((value, { req }) => !req.body.allAvailable).exists().notEmpty(),
];