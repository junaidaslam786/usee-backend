/* eslint-disable max-len */
import { Router } from 'express';

import { isAuthenticated, verifyPermissions, validate } from '@/middleware';
import * as roleController from './role.controller';
import * as roleValidations from './role.request';

const router = Router();

router.get('/list', isAuthenticated, verifyPermissions(['role']), roleController.listRoles);
router.get('/:id', isAuthenticated, verifyPermissions(['role']), roleController.getRole);
router.post('/create', isAuthenticated, verifyPermissions(['role']), validate(roleValidations.createRoleRules), roleController.createRole);
router.put('/update', isAuthenticated, verifyPermissions(['role']), validate(roleValidations.updateRoleRules), roleController.updateRole);
router.delete('/:id', isAuthenticated, verifyPermissions(['role']), roleController.deleteRole);


export default router;
