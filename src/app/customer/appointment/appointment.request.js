import { USER_TYPE } from '@/config/constants';
import { body } from 'express-validator';
import db from '@/database';

export const createAppointmentRules = [
    body('property')
      .exists()
      .withMessage('Property not provided')
      .notEmpty()
      .withMessage('Property cannot be empty'),
    body('appointmentDate')
      .exists()
      .withMessage('Date not provided')
      .notEmpty()
      .withMessage('Date cannot be empty'),
    body('appointmentTime')
      .exists()
      .withMessage('Time not provided')
      .notEmpty()
      .withMessage('Time cannot be empty'),
];

export const updateAppointmentRules = [
    body('id').exists(), 
    body('property')
      .exists()
      .withMessage('Property not provided')
      .notEmpty()
      .withMessage('Property cannot be empty'),
    body('appointmentDate')
      .exists()
      .withMessage('Date not provided')
      .notEmpty()
      .withMessage('Date cannot be empty'),
    body('appointmentTime')
      .exists()
      .withMessage('Time not provided')
      .notEmpty()
      .withMessage('Time cannot be empty'),
];
