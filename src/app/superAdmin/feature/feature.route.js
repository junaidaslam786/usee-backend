import { Router } from 'express';
import * as FeatureController from './feature.controller';
import { createFeatureValidationRules } from './feature.request';

const router = Router();

router.get('/list-all', FeatureController.getAllFeatures);
router.get('/:id', FeatureController.getFeatureById);
router.post('/create', createFeatureValidationRules(), FeatureController.createFeature);
router.put('/:id', FeatureController.updateFeature);
router.delete('/:id', FeatureController.deleteFeature);

export default router;