import { Router } from 'express';

import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, appointmentController.listAppointments);
router.get('/session-token/:id', isAuthenticated, appointmentController.getSessionToken);
router.post('/create', isAuthenticated, validate(appointmentValidations.createAppointmentRules), appointmentController.createAppointment);
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);
router.get('/:id', isAuthenticated, appointmentController.getAppointment);
router.post('/check-availability', isAuthenticated, validate(appointmentValidations.checkAvailabilityRules), appointmentController.checkAvailability);

export default router;
