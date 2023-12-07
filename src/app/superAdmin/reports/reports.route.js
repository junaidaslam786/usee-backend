import { Router } from 'express';
import * as analyticsController from './reports.controller';

const router = Router();

// router.get('/users', analyticsController.getUsersAnalytics);
// router.get('/properties', analyticsController.getActiveUsersAnalytics);
// router.get('/services', analyticsController.getNonActiveUsersAnalytics);

router.get('/users', analyticsController.getUsersData);
router.get('/properties', analyticsController.getPropertiesData);
router.get('/services', analyticsController.getServicesData);

export default router;
