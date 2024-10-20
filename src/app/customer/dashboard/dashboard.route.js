import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as dashboardController from './dashboard.controller';

const router = Router();

router.post('/', isAuthenticated, dashboardController.dashboardData);

export default router;
