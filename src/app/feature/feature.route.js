import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as featureController from './feature.controller';
// import * as featureValidations from './feature.request';

const router = Router();

router.get('/list', isAuthenticated, featureController.getAllFeatures);

export default router;
