import { Router } from 'express';

import * as userController from './user.controller';
import * as userValidations from './user.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, userController.listAgentUsers);
router.get('/to-allocate', isAuthenticated, userController.listAgentUsersToAllocate);
router.post('/create', isAuthenticated, validate(userValidations.createAgentUserRules), userController.createAgentUser);
router.put('/update', isAuthenticated, validate(userValidations.updateAgentUserRules), userController.updateAgentUser);
router.put('/update-branch', isAuthenticated, validate(userValidations.updateAgentUserBranchRules), userController.updateAgentUserBranch);
router.put('/update-sorting', isAuthenticated, validate(userValidations.updateAgentUserSortingRules), userController.updateAgentUserSorting);
router.get('/:id', isAuthenticated, userController.getAgentUser);
router.delete('/:id', isAuthenticated, userController.deleteAgentUser);
router.post('/:userId/subscribe', userController.associateUserToSubscriptionFeatures);
router.get('/:userId/tokens', isAuthenticated, userController.getUserTokens);
router.get('/:userId/token-transactions', isAuthenticated, userController.getUserTokenTransactions);
router.post('/:userId/token-transaction', isAuthenticated, userController.createTokenTransaction);

export default router;
