import { Router } from 'express';

import * as featureController from './feature.controller';
import * as featureValidations from './feature.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, featureController.getAllFeatures);

export default router;
