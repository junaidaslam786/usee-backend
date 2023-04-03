
import { body } from 'express-validator';

export const updateProfileRules = [
    body('firstName').optional(),
    body('lastName').optional(),
    body('email').isEmail().optional(),
];

export const changePasswordRules = [
    body('current').exists().notEmpty(),
    body('password').isLength({ min: 8 }).exists(),
];