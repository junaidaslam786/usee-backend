import { Router } from 'express';
import * as analyticsController from './reports.controller';
import { isAuthenticated, analyticsSubscription, validate } from '@/middleware';

const router = Router();

router.post('/users', isAuthenticated, analyticsSubscription, analyticsController.getUsersData);
router.post('/properties', isAuthenticated, analyticsSubscription, analyticsController.getPropertiesData);
router.post('/services', isAuthenticated, analyticsSubscription, analyticsController.getServicesData);

export default router;
