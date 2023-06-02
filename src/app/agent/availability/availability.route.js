import { Router } from 'express';

import * as availabilityController from './availability.controller';
import { isAuthenticated } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, availabilityController.listAgentAvailability);
router.put('/update', isAuthenticated, availabilityController.updateAgentAvailability);
router.get('/list-slots', isAuthenticated, availabilityController.listAgentAvailabilitySlots);

export default router;
