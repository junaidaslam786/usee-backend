import { Router } from 'express';

import * as categoryController from './category.controller';
import { isAuthenticated, userSubscriptionMiddleware } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, userSubscriptionMiddleware, categoryController.listCategories);
router.get('/:id', isAuthenticated, categoryController.getCategory);

export default router;
