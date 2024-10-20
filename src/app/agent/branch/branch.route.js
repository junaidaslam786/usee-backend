import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as branchController from './branch.controller';
import * as branchValidations from './branch.request';

const router = Router();

router.get('/list', isAuthenticated, branchController.listAgentBranches);
router.post('/create', isAuthenticated,
  validate(branchValidations.createAgentBranchRules), branchController.createAgentBranch);
router.put('/update', isAuthenticated,
  validate(branchValidations.updateAgentBranchRules), branchController.updateAgentBranch);
router.get('/:id', isAuthenticated, branchController.getAgentBranch);
router.delete('/:id', isAuthenticated, branchController.deleteAgentBranch);

export default router;
