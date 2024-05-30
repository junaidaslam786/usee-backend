import { Router } from 'express';
import { isAuthenticated, analyticsSubscription } from '@/middleware';
import * as analyticsController from './reports.controller';

const router = Router();

router.post('/users', isAuthenticated, analyticsSubscription, analyticsController.getUsersData);
router.post('/properties', isAuthenticated, analyticsSubscription, analyticsController.getPropertiesData);
router.post('/services', isAuthenticated, analyticsSubscription, analyticsController.getServicesData);

export default router;
