import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as alertController from './alert.controller';
import * as alertValidations from './alert.request';

const router = Router();

router.get('/list', isAuthenticated, alertController.getCustomerAlerts);
router.get('/unread-count', isAuthenticated, alertController.getCustomerUnReadAlertCounts);
router.post('/create', isAuthenticated,
  validate(alertValidations.createCustomerAlertRules), alertController.createCustomerAlert);
router.delete('/:id', isAuthenticated, alertController.removeCustomerAlert);

export default router;
