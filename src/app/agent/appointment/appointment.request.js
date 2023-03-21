import { USER_TYPE } from '@/config/constants';
import { body } from 'express-validator';
import db from '@/database';

export const createAppointmentRules = [
    body('products')
      .exists()
      .withMessage('products not provided')
      .isArray()
      .withMessage('Products must be an array')
      .notEmpty()
      .withMessage('Products cannot be empty'),
    body('appointmentDate')
      .exists()
      .withMessage('appointmentDate not provided')
      .notEmpty()
      .withMessage('appointmentDate cannot be empty'),
    body('appointmentTime')
      .exists()
      .withMessage('appointmentTime not provided')
      .notEmpty()
      .withMessage('appointmentTime cannot be empty'),
    body('customerFirstName')
      .exists()
      .withMessage('customerFirstName not provided')
      .notEmpty()
      .withMessage('customerFirstName cannot be empty'),
      body('customerLastName')
      .exists()
      .withMessage('customerLastName not provided')
      .notEmpty()
      .withMessage('customerLastName cannot be empty'),
    body('customerEmail')
      .exists()
      .withMessage('customerEmail not provided')
      .notEmpty()
      .withMessage('customerEmail cannot be empty'),
    body('allotedAgent')
      .exists().withMessage('allotedAgent not provided')
      .notEmpty().withMessage('allotedAgent cannot be empty')
      .custom(async (value) => {
        return await db.models.user.findOne({ where: { id: value, userType: USER_TYPE.AGENT } }).then(emailData => {
          if (!emailData) {
            return Promise.reject('Invalid agent id or agent do not exist');
          }
        });
      }),
];

export const updateAppointmentRules = [
    body('id').exists(), 
    body('products')
      .exists()
      .withMessage('products not provided')
      .isArray()
      .withMessage('Products must be an array')
      .notEmpty()
      .withMessage('Products cannot be empty'),
    body('appointmentDate')
      .exists()
      .withMessage('appointmentDate not provided')
      .notEmpty()
      .withMessage('appointmentDate cannot be empty'),
    body('appointmentTime')
      .exists()
      .withMessage('appointmentTime not provided')
      .notEmpty()
      .withMessage('appointmentTime cannot be empty'),
    body('customerFirstName')
      .exists()
      .withMessage('customerFirstName not provided')
      .notEmpty()
      .withMessage('customerFirstName cannot be empty'),
    body('customerLastName')
      .exists()
      .withMessage('customerLastName not provided')
      .notEmpty()
      .withMessage('customerLastName cannot be empty'),
    body('customerEmail')
      .exists()
      .withMessage('customerEmail not provided')
      .notEmpty()
      .withMessage('customerEmail cannot be empty'),
    body('allotedAgent')
      .exists().withMessage('allotedAgent not provided')
      .notEmpty().withMessage('allotedAgent cannot be empty')
      .custom(async (value) => {
        return await db.models.user.findOne({ where: { id: value, userType: USER_TYPE.AGENT } }).then(emailData => {
          if (!emailData) {
            return Promise.reject('Invalid agent id or agent do not exist');
          }
        });
      }),
];
