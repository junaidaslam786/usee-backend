import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as userController from './user.controller';
import * as userValidations from './user.request';

const router = Router();

router.route('/profile')
  .get(isAuthenticated, userController.getCurrentUser)
  .put(isAuthenticated, validate(userValidations.updateProfileRules), userController.updateCurrentUser);
// .delete(isAuthenticated, userController.deleteCurrentUser);
router.put('/update-password', isAuthenticated, validate(userValidations.changePasswordRules),
  userController.updatePassword);
router.put('/update-timezone', isAuthenticated, userController.updateTimezone);
router.get('/list-customer', isAuthenticated, userController.listCustomerUsers);
router.post('/validate-otp', isAuthenticated, validate(userValidations.validateOtpRules), userController.validateOtp);
router.post('/call-background-image', isAuthenticated, validate(userValidations.uploadCallBackgroundImagesRules),
  userController.uploadCallBackgroundImages);
router.delete('/call-background-image', isAuthenticated, validate(userValidations.deleteCallBackgroundImageRules),
  userController.deleteCallBackgroundImage);
router.post('/verify-password', isAuthenticated, validate(userValidations.verifyPasswordRules),
  userController.verifyPassword);
router.delete('/delete', isAuthenticated, userController.deleteUser);

export default router;
