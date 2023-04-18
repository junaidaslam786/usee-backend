import { Router } from 'express';

import { validate } from '@/middleware';
import * as authController from './auth.controller';
import * as authValidations from './auth.request';

const router = Router();

router.post('/login', validate(authValidations.loginRules), authController.login);
router.post('/register-agent', validate(authValidations.registerAgentRules), authController.registerAgent);
router.post('/register-customer', validate(authValidations.registerCustomerRules), authController.registerCustomer);

export default router;
