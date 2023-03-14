
import { body, check } from 'express-validator';

export const updateProfileRules = [
    body('firstName').optional(),
    body('lastName').optional(),
    body('email').isEmail().optional(),
];

export const changePasswordRules = [
    body('current').exists(),
    body('password').isLength({ min: 6 }).exists(),
];