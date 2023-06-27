import { Router } from 'express';

import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, appointmentController.listAppointments);
router.get('/session-token/:id', isAuthenticated, appointmentController.getSessionToken);
router.get('/:id', isAuthenticated, appointmentController.getAppointment);
router.post('/create', isAuthenticated, validate(appointmentValidations.createAppointmentRules), appointmentController.createAppointment);
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);
router.put('/status', isAuthenticated, validate(appointmentValidations.updateStatusAppointmentRules), appointmentController.updateStatusAppointment);
router.post('/log', isAuthenticated, validate(appointmentValidations.addAppointmentLogRules), appointmentController.addAppointmentLog);
router.post('/note', isAuthenticated, validate(appointmentValidations.addAppointmentNoteRules), appointmentController.addAppointmentNote);
router.post('/check-availability', isAuthenticated, validate(appointmentValidations.checkAvailabilityRules), appointmentController.checkAvailability);

export default router;
