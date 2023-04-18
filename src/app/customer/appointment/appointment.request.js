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

// export const updateAppointmentRules = [
//     body('id').exists(), 
//     body('property')
//       .exists()
//       .withMessage('Property not provided')
//       .notEmpty()
//       .withMessage('Property cannot be empty'),
//     body('appointmentDate')
//       .exists()
//       .withMessage('Date not provided')
//       .notEmpty()
//       .withMessage('Date cannot be empty'),
//     body('timeSlotId')
//       .exists()
//       .withMessage('Time not provided')
//       .notEmpty()
//       .withMessage('Time cannot be empty'),
// ];
