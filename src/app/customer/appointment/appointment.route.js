import { Router } from 'express';

import * as appointmentController from './appointment.controller';
import { isAuthenticated } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, appointmentController.listAppointments);
router.get('/session-token/:id', isAuthenticated, appointmentController.getSessionToken);
router.get('/:id', isAuthenticated, appointmentController.getAppointment);


export default router;
