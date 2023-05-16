import { body } from 'express-validator';

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
    body('timeSlotId')
      .exists()
      .withMessage('Time not provided')
      .notEmpty()
      .withMessage('Time cannot be empty'),
];

export const checkAvailabilityRules = [
  body('userId').exists().withMessage('User not provided').notEmpty().withMessage('User should not be empty'),
  body('date').exists().withMessage('Date is not provided').notEmpty().withMessage('Date should not be empty'),
  body('time').exists().withMessage('Time is not provided').notEmpty().withMessage('Time should not be empty'),
];
