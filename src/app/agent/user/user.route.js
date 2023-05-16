import { Router } from 'express';

import * as userController from './user.controller';
import * as userValidations from './user.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, userController.listAgentUsers);
router.get('/to-allocate', isAuthenticated, userController.listAgentUsersToAllocate);
router.post('/create', validate(userValidations.createAgentUserRules), isAuthenticated, userController.createAgentUser);
router.get('/supervisor', isAuthenticated, userController.getAgentSupervisor);
router.post('/create-supervisor', validate(userValidations.createAgentSupervisorRules), isAuthenticated, userController.createAgentSupervisor);
router.post('/update-supervisor', validate(userValidations.updateAgentSupervisorRules), isAuthenticated, userController.updateAgentSupervisor);
router.put('/update-branch', validate(userValidations.updateAgentUserBranchRules), isAuthenticated, userController.updateAgentUserBranch);
router.put('/update-sorting', validate(userValidations.updateAgentUserSortingRules), isAuthenticated, userController.updateAgentUserSorting);
router.get('/:id', isAuthenticated, userController.getAgentUser);
router.delete('/:id', isAuthenticated, userController.deleteAgentUser);

export default router;
