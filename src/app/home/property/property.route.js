

import { Router } from 'express';

import * as propertyController from './property.controller';

const router = Router();

router.post('/list', propertyController.listHomePageProperties);
router.post('/search-polygon', propertyController.searchPolygon);
router.post('/search-circle', propertyController.searchCircle);
router.get('/:id', propertyController.getProperty);

export default router;
