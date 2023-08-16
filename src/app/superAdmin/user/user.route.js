/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as userController from './user.controller';
import * as userValidations from './user.request';

const router = Router();
router.get('/superadmin-details', userController.getSuperAdminDetails);
router.put('/user/update', isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser);
router.get('/list-all', isAuthenticated, userController.listAdminUsers);
router.get('/customer/list-customer', isAuthenticated, userController.listCustomerUsers);
router.get('/total-customer', isAuthenticated, userController.totalCustomers);
router.post('/user/:id', isAuthenticated, userController.getUserById);
router.delete('/user/:id', isAuthenticated, userController.deleteCurrentUser);

export default router;
