import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as appointmentController from './appointment.controller';

const router = Router();

router.get('/all-appointments', isAuthenticated, appointmentController.listCompletedAppointments);
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);

export default router;
