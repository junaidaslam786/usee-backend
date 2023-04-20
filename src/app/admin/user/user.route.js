/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as userController from './user.controller';
import * as userValidations from './user.request';

const router = Router();
router.put('/user/update', isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser);
router.get('/customer/list-customer', isAuthenticated, userController.listCustomerUsers);
router.get('/total-customer', isAuthenticated, userController.totalCustomers);
router.delete('/customer/:id', isAuthenticated, userController.deleteCurrentUser);

export default router;
