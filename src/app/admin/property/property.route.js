/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate, verifyPermissions } from '@/middleware';
import * as propertyController from './property.controller';
import * as propertyValidations from './property.request';

const router = Router();
router.get('/property-list', isAuthenticated, propertyController.listProperties);
router.get('/property-removal-request', isAuthenticated, verifyPermissions(['role']), propertyController.propertyRemovalRequest);
router.get('/removed-property-request', isAuthenticated, verifyPermissions(['role']), propertyController.removedPropertyList);
router.get('/:id', propertyController.getProperty);
export default router;
