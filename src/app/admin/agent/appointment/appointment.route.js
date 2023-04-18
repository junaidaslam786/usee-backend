/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';

const router = Router();

router.get('/all-appointments', isAuthenticated, appointmentController.listCompletedAppointments);
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);

export default router;
