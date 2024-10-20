import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as categoryController from './category.controller';

const router = Router();

router.get('/list', isAuthenticated, categoryController.listCategories);
router.get('/:id', isAuthenticated, categoryController.getCategory);

export default router;
