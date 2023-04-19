import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as propertyController from './property.controller';

const router = Router();

router.get('/property-list', isAuthenticated, propertyController.listProperties);

export default router;
