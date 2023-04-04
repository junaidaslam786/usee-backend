/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as userController from './user.controller';
import * as userValidations from './user.request';

const router = Router();
router.get('/agent/list', isAuthenticated, userController.listAgentUsers);
router.get('/manager/list-manager', isAuthenticated, userController.listAdminUsers);
// router.post('/agent/:id', isAuthenticated, userController.agentUsersByID);
router.put('/user/update', isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser);
router.route('/profile')
  .get(isAuthenticated, userController.getCurrentUser)
  .put(isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser)
  .delete(isAuthenticated, userController.deleteCurrentUser);

router.put('/update-password', isAuthenticated, validate(userValidations.changePasswordRules), userController.updatePassword);
router.get('/customer/list-customer', isAuthenticated, userController.listCustomerUsers);
router.get('/total-customer', isAuthenticated, userController.totalCustomers);
router.delete('/customer/:id', isAuthenticated, userController.deleteCurrentUser);

export default router;
