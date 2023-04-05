import { Router } from 'express';

import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, appointmentController.listAppointments);
router.get('/session-token/:id', isAuthenticated, appointmentController.getSessionToken);
router.post('/create', isAuthenticated, validate(appointmentValidations.createAppointmentRules), appointmentController.createAppointment);
router.put('/update', isAuthenticated, validate(appointmentValidations.updateAppointmentRules), appointmentController.updateAppointment);
router.get('/:id', isAuthenticated, appointmentController.getAppointment);

export default router;
