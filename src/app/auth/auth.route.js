import { Router } from 'express';

import * as authController from './auth.controller';
import * as authValidations from './auth.request';
import { validate } from '@/middleware';

const router = Router();

router.post('/login', validate(authValidations.loginRules), authController.login);
router.post('/register-agent', validate(authValidations.registerAgentRules), authController.registerAgent);
router.post('/register-customer', validate(authValidations.registerCustomerRules), authController.registerCustomer);
router.get('/forgot-password', validate(authValidations.forgotPasswordRules), authController.forgotPassword);
router.post('/reset-password', validate(authValidations.resetPasswordRules), authController.resetPassword);
router.post('/send-otp', validate(authValidations.sendOtpRules), authController.sendOtp);
router.get('/check-field-exist', authController.checkFieldExists);
router.get('/fetch-token-price', authController.fetchTokenPrice);

export default router;
