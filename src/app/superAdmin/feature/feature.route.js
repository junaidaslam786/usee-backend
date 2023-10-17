import { Router } from 'express';
import * as FeatureController from './feature.controller';
import { createFeatureValidationRules } from './feature.request';

const router = Router();

router.get('/feature/list-all', FeatureController.getAllFeatures);
router.get('/feature/:id', FeatureController.getFeatureById);
router.post('/feature/create', createFeatureValidationRules(), FeatureController.createFeature);
router.put('/feature/:id', FeatureController.updateFeature);
router.delete('/feature/:id', FeatureController.deleteFeature);

export default router;
