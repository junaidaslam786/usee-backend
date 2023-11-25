import createError from 'http-errors';
import * as userService from './user.service';

/**
 * POST /customer/user/:userId/product-visit
 * Create product visit for user
 */
export const createProductVisit = async (req, res, next) => {
    try {
        const result = await userService.createProductVisit(req.params?.userId, req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.status(201).json(result);
    } catch (err) {
        console.log('createAgentUsersError', err);
        next(err);
    }
}