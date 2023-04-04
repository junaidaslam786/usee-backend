import { body } from 'express-validator';
import db from '@/database';

export const createAgentAlertRules = [
    body('productId').exists().custom(async (value) => {
        return await db.models.product.findOne({ where: { id: value } }).then(productData => {
            if (!productData) {
                return Promise.reject('Invalid product id or product do not exist.');
            }
        });
    }),
    body('alertMode').exists(),
    body('alertType').exists(),
];