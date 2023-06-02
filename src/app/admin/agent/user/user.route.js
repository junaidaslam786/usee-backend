import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as userController from './user.controller';

const router = Router();

router.get('/list', isAuthenticated, userController.listAgentUsers);
router.get('/blocked', isAuthenticated, userController.listBlockedAgentUsers);
router.put('/update-status', isAuthenticated, userController.updateAgentUserStatus);
router.post('/:id', isAuthenticated, userController.getAgentUser);
router.delete('/:id', isAuthenticated, userController.deleteAgentUser);

export default router;
