import { Router } from 'express';

import * as availabilityController from './availability.controller';
import * as availabilityValidations from './availability.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, availabilityController.listAgentAvailability);
router.put('/update', validate(availabilityValidations.updateAgentAvailabilityRules), isAuthenticated, availabilityController.updateAgentAvailability);

export default router;
