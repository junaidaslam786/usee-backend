import { Router } from 'express';
import * as analyticsController from './search.controller';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

// Search route for properties, users, and appointments
router.get('/all', isAuthenticated, analyticsController.searchAll);
router.get('/appointments', isAuthenticated, analyticsController.searchAppointments);
router.get('/properties', isAuthenticated, analyticsController.searchProperties);
router.get('/users', isAuthenticated, analyticsController.searchUsers);

export default router;
