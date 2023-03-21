import { Router } from 'express';

import * as categoryController from './category.controller';
import { isAuthenticated } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, categoryController.listCategories);
router.get('/:id', isAuthenticated, categoryController.getCategory);

export default router;
