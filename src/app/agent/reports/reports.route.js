import { Router } from 'express';
import * as analyticsController from './reports.controller';

const router = Router();

router.post('/users', analyticsController.getUsersData);
router.post('/properties', analyticsController.getPropertiesData);
router.post('/services', analyticsController.getServicesData);

export default router;
