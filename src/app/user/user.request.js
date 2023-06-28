import { body } from 'express-validator';
import db from '@/database';

export const updateProfileRules = [
    body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
    body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
    body('email').isEmail().optional(),
];

export const changePasswordRules = [
    body('current').exists().withMessage('Please provide current password').notEmpty().withMessage('Please provide current password'),
    body('password')
        .exists().withMessage('Please provide new password')
        .notEmpty().withMessage('Please provide new password')
        .isLength({ min: 8 })
        .withMessage('Password must contain at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*(),.?":{}|<>]/)
        .withMessage('Password must contain at least one special character'),
];

export const validateOtpRules = [
    body('otp').exists().withMessage('Please provide otp').notEmpty().withMessage('Please provide otp'),
];

export const uploadCallBackgroundImagesRules = [
    body('userId').exists().custom(async (value) => {
      return await db.models.user.findOne({ where: { id: value } }).then(usertData => {
        if (!usertData) {
          return Promise.reject('Invalid user id or user do not exist.');
        }
      });
    }), 
  ];

export const deleteCallBackgroundImageRules = [
    body('userId').exists().custom(async (value) => {
      return await db.models.user.findOne({ where: { id: value } }).then(usertData => {
        if (!usertData) {
          return Promise.reject('Invalid user id or user do not exist.');
        }
      });
    }), 
    body('imageId').exists().custom(async (value) => {
      return await db.models.userCallBackgroundImage.findOne({ where: { id: value } }).then(userCallBackgroundImageData => {
        if (!userCallBackgroundImageData) {
          return Promise.reject('Invalid image id or image do not exist.');
        }
      });
    }), 
  ];