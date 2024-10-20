import { Router } from 'express';

import { isAuthenticated, validate } from '@/middleware';
import * as wishlistController from './wishlist.controller';
import * as wishlistValidations from './wishlist.request';

const router = Router();

router.get('/list', isAuthenticated, wishlistController.listWishlist);
router.get('/add/:id', isAuthenticated,
  validate(wishlistValidations.wishlistRules), wishlistController.addProductToWishlist);
router.delete('/remove/:id', isAuthenticated,
  validate(wishlistValidations.wishlistRules), wishlistController.removeProductFromWishlist);

export default router;
