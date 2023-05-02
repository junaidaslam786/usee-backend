import { Router } from 'express';

import * as dashboardController from './dashboard.controller';
import { isAuthenticated } from '@/middleware';

const router = Router();

router.get('/dashboard', isAuthenticated, dashboardController.dashboardData);

export default router;
