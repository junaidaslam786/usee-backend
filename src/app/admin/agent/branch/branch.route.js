import { Router } from 'express';

import * as branchController from './branch.controller';
import * as branchValidations from './branch.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, branchController.listAgentBranches);
router.post('/create', validate(branchValidations.createAgentBranchRules), isAuthenticated, branchController.createAgentBranch);
router.put('/update', validate(branchValidations.updateAgentBranchRules), isAuthenticated, branchController.updateAgentBranch);
router.get('/:id', isAuthenticated, branchController.getAgentBranch);
router.delete('/:id', isAuthenticated, branchController.deleteAgentBranch);

export default router;
