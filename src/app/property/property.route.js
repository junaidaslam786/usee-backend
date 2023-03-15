import { Router } from 'express';

import * as propertyController from './property.controller';
import * as propertyValidations from './property.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, propertyController.listProperties);
router.get('/:id', isAuthenticated, propertyController.getProperty);
router.post('/create', isAuthenticated, validate(propertyValidations.createPropertyRules), propertyController.createProperty);
router.post('/documents', isAuthenticated, validate(propertyValidations.uploadPropertyDocumentRules), propertyController.uploadPropertyDocuments);
router.post('/images', isAuthenticated, validate(propertyValidations.uploadPropertyImageRules), propertyController.uploadPropertyImages);
// router.put('/update', isAuthenticated, validate(propertyValidations.updateRoleRules), propertyController.updateRole);
router.post('/removal-request', isAuthenticated, validate(propertyValidations.removalRequestRules), propertyController.removePropertyRequest);


export default router;
