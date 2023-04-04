/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';

const router = Router();

router.get('/completed', isAuthenticated, appointmentController.listCompletedAppointments);
router.get('/upcoming', isAuthenticated, appointmentController.listUpcomingAppointments);
router.get('/session-token/:id', isAuthenticated, appointmentController.getSessionToken);
router.get('/:id', isAuthenticated, appointmentController.getAppointment);
router.post('/create', isAuthenticated, validate(appointmentValidations.createAppointmentRules), appointmentController.createAppointment);
router.put('/update', isAuthenticated, validate(appointmentValidations.updateAppointmentRules), appointmentController.updateAppointment);
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);

export default router;
