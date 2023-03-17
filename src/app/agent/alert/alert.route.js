import { Router } from 'express';

import * as alertController from './alert.controller';
import { isAuthenticated } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, alertController.getAgentAlerts);
router.delete('/:id', isAuthenticated, alertController.removeAgentAlert);

export default router;
