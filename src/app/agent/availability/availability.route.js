import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as availabilityController from './availability.controller';

const router = Router();

router.get('/list', isAuthenticated, availabilityController.listAgentAvailability);
router.put('/update', isAuthenticated, availabilityController.updateAgentAvailability);
router.get('/list-slots', isAuthenticated, availabilityController.listAgentAvailabilitySlots);

export default router;
