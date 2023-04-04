import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.get('/', isAuthenticated, dashboardController.dashboardData);
router.get('/agentCount', dashboardController.agentCount);
router.get('/customerCount', dashboardController.customerCount);
router.get('/propertyCount', dashboardController.propertyCount);
router.get('/appointmentCount', dashboardController.appointmentCount);

export default router;
