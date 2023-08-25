import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as propertyController from './property.controller';
import * as propertyValidations from './property.request';

const router = Router();

router.get('/property-list', isAuthenticated, propertyController.listProperties);
router.get('/removal-requests', isAuthenticated, propertyController.listPropertyRemovalRequest);
router.put('/removal-request/approved', isAuthenticated, validate(propertyValidations.removalRequestRules), propertyController.approvePropertyRemovalRequest);


export default router;
