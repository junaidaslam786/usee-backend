import { body } from 'express-validator';

export const updateAgentAvailabilityRules = [
    body('allAvailable').isBoolean().exists(),
    body('slotDay').if((value, { req }) => !req.body.allAvailable).exists().notEmpty(),
    body('timeSlots').if((value, { req }) => !req.body.allAvailable).exists().notEmpty(),
];