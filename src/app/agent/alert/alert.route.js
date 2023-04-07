import { Router } from 'express';

import * as alertController from './alert.controller';
import * as alertValidations from './alert.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, alertController.getAgentAlerts);
router.get('/unread-count', isAuthenticated, alertController.getAgentUnReadAlertCounts);
router.post('/create', isAuthenticated, validate(alertValidations.createAgentAlertRules), alertController.createAgentAlert);
router.delete('/:id', isAuthenticated, alertController.removeAgentAlert);

export default router;
