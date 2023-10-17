import { check } from 'express-validator';

export const createFeatureValidationRules = () => {
  return [
    check('name').not().isEmpty().withMessage('Name is required'),
  ];
};
