import { body } from 'express-validator';
import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

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
    body('customerName')
      .exists()
      .withMessage('customerName not provided')
      .notEmpty()
      .withMessage('customerName cannot be empty'),
    body('customerEmail')
      .exists()
      .withMessage('customerEmail not provided')
      .notEmpty()
      .withMessage('customerEmail cannot be empty'),
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
];
