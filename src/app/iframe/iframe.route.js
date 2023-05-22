import { Router } from 'express';

import * as iframeController from './iframe.controller';
import * as iframeValidations from './iframe.request';
import { validate } from '@/middleware';

const router = Router();

router.post('/wishlist', validate(iframeValidations.addToWishlistRules), iframeController.addToWishlist);
router.post('/appointment', validate(iframeValidations.addAppointmentRules), iframeController.addAppointment);
router.get('/list-slots', iframeController.listAvailabilitySlots);
router.post('/check-availability', validate(iframeValidations.checkAvailabilityRules), iframeController.checkAvailability);
router.get('/to-allocate', iframeController.listAgentUsersToAllocate);

export default router;
