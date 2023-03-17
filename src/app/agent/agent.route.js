import { Router } from 'express';

import * as agentController from './agent.controller';
import * as agentValidations from './agent.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/users/list', isAuthenticated, agentController.listAgentUsers);
router.post('/users/create', validate(agentValidations.createAgentUserRules), isAuthenticated, agentController.createAgentUsers);
router.put('/users/update-branch', validate(agentValidations.updateAgentUserBranchRules), isAuthenticated, agentController.updateAgentUserBranch);
router.put('/users/update-sorting', validate(agentValidations.updateAgentUserSortingRules), isAuthenticated, agentController.updateAgentUserSorting);
router.get('/users/:id', isAuthenticated, agentController.getAgentUser);
router.delete('/users/:id', isAuthenticated, agentController.deleteAgentUser);
router.get('/alert', isAuthenticated, agentController.getAgentAlerts);
router.delete('/alert/:id', isAuthenticated, agentController.removeAgentAlert);

export default router;
