import { Router } from 'express';

import * as propertyController from './property.controller';
import * as propertyValidations from './property.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, propertyController.listProperties);
router.get('/to-allocate', isAuthenticated, propertyController.listPropertiesToAllocate);
router.get('/to-allocate-customer', isAuthenticated, propertyController.listPropertiesAllocateToCustomer);
router.get('/list-removal-reasons', isAuthenticated, propertyController.listRemovalReasons);
router.get('/:id', isAuthenticated, propertyController.getProperty);
router.post('/create', isAuthenticated, validate(propertyValidations.createPropertyRules), propertyController.createProperty);
router.put('/update', isAuthenticated, validate(propertyValidations.updatePropertyRules), propertyController.updateProperty);
router.post('/document', isAuthenticated, validate(propertyValidations.uploadPropertyDocumentRules), propertyController.uploadPropertyDocuments);
router.delete('/document', isAuthenticated, validate(propertyValidations.deletePropertyDocumentRules), propertyController.deletePropertyDocument);
router.post('/image', isAuthenticated, validate(propertyValidations.uploadPropertyImageRules), propertyController.uploadPropertyImages);
router.delete('/image', isAuthenticated, validate(propertyValidations.deletePropertyImageRules), propertyController.deletePropertyImage);
router.post('/removal-request', isAuthenticated, validate(propertyValidations.removalRequestRules), propertyController.removePropertyRequest);

// offer
router.post('/customer/make-offer', isAuthenticated, validate(propertyValidations.customerOfferRequestRules), propertyController.addCustomerOffer);
router.delete('/customer/offer/:id', isAuthenticated, propertyController.deleteCustomerOffer);
router.post('/agent/update-offer', isAuthenticated, validate(propertyValidations.updateOfferStatusRequestRules), propertyController.updateOfferStatus);
router.post('/customer/snag-list', isAuthenticated, propertyController.updateCustomerSnaglist);
router.post('/agent/snag-list', isAuthenticated, propertyController.updateAgentSnaglist);

export default router;
