import { Router } from 'express';

import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';
import { isAuthenticated, validate, verifyPermissions } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, /*verifyPermissions(['appointment']),*/ appointmentController.listAppointments);
router.get('/:id', isAuthenticated, /*verifyPermissions(['appointment']),*/ appointmentController.getAppointment);
router.post('/create', isAuthenticated, /*verifyPermissions(['appointment']),*/ validate(appointmentValidations.createAppointmentRules), appointmentController.createAppointment);
router.put('/update', isAuthenticated, /*verifyPermissions(['appointment']),*/ validate(appointmentValidations.updateAppointmentRules), appointmentController.updateAppointment);
router.delete('/:id', isAuthenticated, /*verifyPermissions(['appointment']),*/ appointmentController.deleteAppointment);
router.get('/getSessionToken/:id', isAuthenticated, /*verifyPermissions(['appointment']),*/ appointmentController.getSessionToken);


export default router;
