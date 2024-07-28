import { Router } from 'express';

import { isAuthenticated, videoCallRecordingSubscription, validate } from '@/middleware';
import * as appointmentController from './appointment.controller';
import * as appointmentValidations from './appointment.request';

const router = Router();

router.get('/list', isAuthenticated, appointmentController.listAppointments);
router.get('/session-token/:id', isAuthenticated, appointmentController.getSessionToken);
router.get('/session-details/:id', isAuthenticated, appointmentController.getSessionDetails);
router.get('/download-archive/:archiveId', isAuthenticated,
  videoCallRecordingSubscription, appointmentController.downloadSessionRecording);
router.get('/:id', isAuthenticated, appointmentController.getAppointment);
router.post('/create', isAuthenticated, validate(appointmentValidations.createAppointmentRules),
  appointmentController.createAppointment);
router.delete('/:id', isAuthenticated, appointmentController.deleteAppointment);
router.put('/status', isAuthenticated, validate(appointmentValidations.updateStatusAppointmentRules),
  appointmentController.updateStatusAppointment);
router.post('/log', isAuthenticated, validate(appointmentValidations.addAppointmentLogRules),
  appointmentController.addAppointmentLog);
router.post('/note', isAuthenticated, validate(appointmentValidations.addAppointmentNoteRules),
  appointmentController.addAppointmentNote);
router.post('/check-availability', isAuthenticated, validate(appointmentValidations.checkAvailabilityRules),
  appointmentController.checkAvailability);

export default router;
