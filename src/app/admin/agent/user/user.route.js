/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as userController from './user.controller';
import * as userValidations from './user.request';

const router = Router();

router.get('/list', isAuthenticated, userController.listAgentUsers);
router.get('/blocked', isAuthenticated, userController.listBlockedAgentUsers);
router.get('/to-allocate', isAuthenticated, userController.listAgentUsersToAllocate);
router.post('/check-availability', validate(userValidations.checkAvailabilityRules), isAuthenticated, userController.checkAvailability);
router.post('/create', validate(userValidations.createAgentUserRules), isAuthenticated, userController.createAgentUser);
router.put('/update-branch', validate(userValidations.updateAgentUserBranchRules), isAuthenticated, userController.updateAgentUserBranch);
router.put('/update-sorting', validate(userValidations.updateAgentUserSortingRules), isAuthenticated, userController.updateAgentUserSorting);
router.put('/update-status', isAuthenticated, userController.updateAgentUserStatus);
router.post('/:id', isAuthenticated, userController.getAgentUser);
router.delete('/:id', userController.deleteAgentUser);

export default router;
