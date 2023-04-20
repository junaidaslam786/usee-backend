import { body } from 'express-validator';
import db from '@/database';


export const registerCustomerRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty().withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty().withMessage('Please provide last name'),
  body('email').isEmail().exists().custom(async (value) => {
    return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then(userData => {
      if (userData) {
        return Promise.reject('Email address already exist.');
      }
    });
  }),
  body('productId').exists().custom(async (value) => {
    return await db.models.product.findOne({ where: { id: value } }).then(productData => {
      if (!productData) {
        return Promise.reject('Invalid product id or product do not exist.');
      }
    });
  }), 
]