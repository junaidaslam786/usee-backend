import { Router } from 'express';

import * as iframeController from './iframe.controller';
import * as iframeValidations from './iframe.request';
import { validate } from '@/middleware';

const router = Router();

router.post('/register-customer', validate(iframeValidations.registerCustomerRules), iframeController.registerCustomer);

export default router;
