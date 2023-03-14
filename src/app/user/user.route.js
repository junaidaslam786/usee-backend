import { Router } from 'express';

import * as userController from './user.controller';
import * as userValidations from './user.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.route('/profile')
  .get(isAuthenticated, userController.getCurrentUser)
  .put(isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser)
  .delete(isAuthenticated, userController.deleteCurrentUser);

router.put('/update-password',
  isAuthenticated,
  validate(userValidations.changePasswordRules),
  userController.updatePassword);

export default router;
