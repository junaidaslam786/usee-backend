
import { body } from 'express-validator';

export const updateProfileRules = [
    body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
    body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
    body('email').isEmail().optional(),
];

export const changePasswordRules = [
    body('current').exists().withMessage('Please provide current password').notEmpty().withMessage('Please provide current password'),
    body('password').isLength({ min: 8 }).withMessage('Password length must be at least 8 digits').exists().withMessage('Please provide password'),
];