import createError from 'http-errors';
import * as featureService from './feature.service';

/**
 * GET /feature/list
 * List all features
 */
export const getAllFeatures = async (req, res, next) => {
    try {
        const result = await featureService.getAllFeatures(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getFeatureError', err);
        next(err);
    }
};
