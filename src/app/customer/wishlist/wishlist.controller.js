import createError from 'http-errors';
import * as wishlistService from './wishlist.service';

/**
 * GET /customer/wishlist/list
 * List all products added in the wishlist
 */
export const listWishlist = async (req, res, next) => {
    try {
      const result = await wishlistService.listWishlist(req.user, req.dbInstance);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listWishlistError', err);
      return next(err);
    }
};

/**
 * GET /customer/wishlist/add
 * Add product into the customer wishlist
 */
export const addProductToWishlist = async (req, res, next) => {
    try {
        const result = await wishlistService.addProductToWishlist(req.params.id, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(201).json(result);
    } catch (err) {
        console.log('addProductToWishlistError', err);
        next(err);
    }
};

/**
 * GET /customer/wishlist/remove
 * Remove product from customer wishlist
 */
export const removeProductFromWishlist = async (req, res, next) => {
    try {
        const result = await wishlistService.removeProductFromWishlist(req.params.id, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Property removed from wishlist successfully" });
    } catch (err) {
        console.log('removeProductFromWishlistError', err);
        next(err);
    }
};