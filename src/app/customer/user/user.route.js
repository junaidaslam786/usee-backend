import { Router } from 'express';

import * as userController from './user.controller';
import * as userValidations from './user.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.post('/:userId/product-visit', isAuthenticated, userController.createProductVisit);

export default router;
