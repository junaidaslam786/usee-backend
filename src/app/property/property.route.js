import { Router } from 'express';

import { isAuthenticated, propertySubscription, validate } from '@/middleware';
import * as propertyController from './property.controller';
import * as propertyValidations from './property.request';

const router = Router();

router.get('/list', isAuthenticated, propertyController.listProperties);
router.get('/to-allocate', isAuthenticated, propertyController.listPropertiesToAllocate);
router.get('/to-allocate-customer', isAuthenticated, propertyController.listPropertiesAllocateToCustomer);
router.get('/list-removal-reasons', isAuthenticated, propertyController.listRemovalReasons);
router.get('/:id', isAuthenticated, propertyController.getProperty);
router.get('/:id/carbon-footprint', isAuthenticated, propertyController.getCarbonFootprintDetails);
router.post('/create', isAuthenticated, propertySubscription, validate(propertyValidations.createPropertyRules),
  propertyController.createProperty);
router.put('/update', isAuthenticated, validate(propertyValidations.updatePropertyRules),
  propertyController.updateProperty);
router.post('/document', isAuthenticated, validate(propertyValidations.uploadPropertyDocumentRules),
  propertyController.uploadPropertyDocuments);
router.delete('/document', isAuthenticated, validate(propertyValidations.deletePropertyDocumentRules),
  propertyController.deletePropertyDocument);
router.post('/image', isAuthenticated, validate(propertyValidations.uploadPropertyImageRules),
  propertyController.uploadPropertyImages);
router.delete('/image', isAuthenticated, validate(propertyValidations.deletePropertyImageRules),
  propertyController.deletePropertyImage);
router.post('/featured-image', isAuthenticated, validate(propertyValidations.uploadFeaturedImageRules),
  propertyController.uploadFeaturedImage);
router.post('/virtual-tour', isAuthenticated, validate(propertyValidations.uploadVirtualTourRules),
  propertyController.uploadVirtualTour);
router.post('/removal-request', isAuthenticated, validate(propertyValidations.removalRequestRules),
  propertyController.removePropertyRequest);
router.post('/qrcode', isAuthenticated, validate(propertyValidations.uploadQrCodeRules),
  propertyController.uploadQrCode);
router.delete('/allocated', isAuthenticated, validate(propertyValidations.deleteAllocatedPropertyRules),
  propertyController.deleteAllocatedProperty);
router.get('/offer/:id', isAuthenticated, propertyController.getPropertyOffer);
router.post('/customer/make-offer', isAuthenticated, validate(propertyValidations.customerOfferRequestRules),
  propertyController.addCustomerOffer);
router.delete('/customer/offer/:id', isAuthenticated, propertyController.deleteCustomerOffer);
router.post('/agent/update-offer', isAuthenticated, validate(propertyValidations.updateOfferStatusRequestRules),
  propertyController.updateOfferStatus);
router.post('/agent/enable-snaglist', isAuthenticated, propertyController.enableAgentSnaglist);
router.post('/agent/check-snaglist', isAuthenticated, propertyController.checkAgentSnaglist);
router.post('/customer/snag-list', isAuthenticated, propertyController.updateCustomerSnaglist);
router.post('/agent/snag-list', isAuthenticated, propertyController.updateAgentSnaglist);
router.post('/log', isAuthenticated, validate(propertyValidations.addPropertyLogRules),
  propertyController.addPropertyLog);

export default router;
