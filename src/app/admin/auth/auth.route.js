import { Router } from 'express';

import { validate } from '@/middleware';
import * as authController from './auth.controller';
import * as authValidations from './auth.request';

const router = Router();

router.post('/login', validate(authValidations.loginRules), authController.login);
router.post('/register-admin', validate(authValidations.registerAdminRules), authController.registerAdmin);
router.post('/register-agent', validate(authValidations.registerAgentRules), authController.registerAgent);
router.post('/register-customer', validate(authValidations.registerCustomerRules), authController.registerCustomer);
router.get('/forgot-password', validate(authValidations.forgotPasswordRules), authController.forgotPassword);
router.post('/reset-password', validate(authValidations.resetPasswordRules), authController.resetPassword);

export default router;
