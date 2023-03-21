import { Router } from 'express';

import * as wishlistController from './wishlist.controller';
import * as wishlistValidations from './wishlist.request';
import { isAuthenticated, validate } from '@/middleware';

const router = Router();

router.get('/list', isAuthenticated, wishlistController.listWishlist);
router.get('/add/:id', isAuthenticated, validate(wishlistValidations.wishlistRules), wishlistController.addProductToWishlist);
router.delete('/remove/:id', isAuthenticated, validate(wishlistValidations.wishlistRules), wishlistController.removeProductFromWishlist);

export default router;
