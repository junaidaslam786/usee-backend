/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as userController from './user.controller';
import * as userValidations from './user.request';

const router = Router();

router.get('/list', isAuthenticated, userController.listAgentUsers);
router.get('/blocked', isAuthenticated, userController.listBlockedAgentUsers);
router.put('/update-status', isAuthenticated, userController.updateAgentUserStatus);
router.post('/:id', isAuthenticated, userController.getAgentUser);
router.delete('/:id', userController.deleteAgentUser);

export default router;
