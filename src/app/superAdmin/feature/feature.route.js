import { Router } from 'express';
import * as featureController from './feature.controller';
import { createFeatureValidationRules } from './feature.request';

const router = Router();

router.get('/list-all', featureController.getAllFeatures);
router.get('/:id', featureController.getFeatureById);
router.post('/create', createFeatureValidationRules(), featureController.createFeature);
router.put('/:id', featureController.updateFeature);
router.delete('/:id', featureController.deleteFeature);

export default router;