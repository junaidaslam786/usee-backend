import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as authController from './auth.controller';
import * as authValidations from './auth.request';

const router = Router();

router.post('/login', validate(authValidations.loginRules), authController.login);
router.post('/forgot-password', validate(authValidations.forgotPasswordRules), authController.forgotPassword);
router.put('/update-password', authController.updatePassword);
router.post('/register-admin', isAuthenticated, validate(authValidations.registerSuperAdminRules), authController.registerAdmin);
router.post('/register-agent', isAuthenticated, validate(authValidations.registerAgentRules), authController.registerAgent);
router.post('/register-customer', isAuthenticated, validate(authValidations.registerCustomerRules), authController.registerCustomer);

export default router;