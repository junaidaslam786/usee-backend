import { body } from 'express-validator';

export const createAppointmentRules = [
    body('properties')
      .exists()
      .withMessage('Properties not provided')
      .isArray()
      .withMessage('Properties must be an array')
      .notEmpty()
      .withMessage('Properties cannot be empty'),
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
    body('customerFirstName')
      .exists()
      .withMessage('Name not provided')
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('customerEmail')
      .exists()
      .withMessage('Email not provided')
      .notEmpty()
      .withMessage('Email cannot be empty'),
    // body('allotedAgent')
    //   .exists().withMessage('Agent not provided')
    //   .notEmpty().withMessage('Agent cannot be empty')
    //   .custom(async (value) => {
    //     return await db.models.user.findOne({ where: { id: value, userType: USER_TYPE.AGENT } }).then(emailData => {
    //       if (!emailData) {
    //         return Promise.reject('Invalid agent id or agent do not exist');
    //       }
    //     });
    //   }),
];

export const updateAppointmentRules = [
    body('id').exists(), 
    body('properties')
      .exists()
      .withMessage('Properties not provided')
      .isArray()
      .withMessage('Properties must be an array')
      .notEmpty()
      .withMessage('Properties cannot be empty'),
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
    body('customerFirstName')
      .exists()
      .withMessage('Name not provided')
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('customerEmail')
      .exists()
      .withMessage('Email not provided')
      .notEmpty()
      .withMessage('Email cannot be empty'),
    // body('allotedAgent')
    //   .exists().withMessage('Agent not provided')
    //   .notEmpty().withMessage('Agent cannot be empty')
    //   .custom(async (value) => {
    //     return await db.models.user.findOne({ where: { id: value, userType: USER_TYPE.AGENT } }).then(emailData => {
    //       if (!emailData) {
    //         return Promise.reject('Invalid agent id or agent do not exist');
    //       }
    //     });
    //   }),
];

export const updateStatusAppointmentRules = [
  body('id')
    .exists()
    .withMessage('Id not provided')
    .notEmpty()
    .withMessage('Id cannot be empty'),
  body('status')
    .exists()
    .withMessage('Status not provided')
    .notEmpty()
    .withMessage('Status cannot be empty'),
];

export const addAppointmentLogRules = [
  body('id')
    .exists()
    .withMessage('Id not provided')
    .notEmpty()
    .withMessage('Id cannot be empty'),
  body('logType')
    .exists()
    .withMessage('Log type not provided')
    .notEmpty()
    .withMessage('Log type cannot be empty'),
];

export const addAppointmentNoteRules = [
  body('id')
    .exists()
    .withMessage('Id not provided')
    .notEmpty()
    .withMessage('Id cannot be empty'),
  body('userId')
    .exists()
    .withMessage('User id not provided')
    .notEmpty()
    .withMessage('User id cannot be empty'),
  body('userType')
    .exists()
    .withMessage('User type not provided')
    .notEmpty()
    .withMessage('User type cannot be empty'),
  body('notes')
    .exists()
    .withMessage('Notes not provided')
    .notEmpty()
    .withMessage('Notes cannot be empty'),
];