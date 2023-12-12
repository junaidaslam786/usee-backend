import { Router } from 'express';
import * as analyticsController from './reports.controller';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.post('/users', isAuthenticated, analyticsController.getUsersData);
router.post('/properties', isAuthenticated, analyticsController.getPropertiesData);
router.post('/services', isAuthenticated, analyticsController.getServicesData);

export default router;
