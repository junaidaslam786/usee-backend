import createError from 'http-errors';
import * as propertyService from './property.service';

/**
 * GET /admin/property/list
 * List all properties
 */
export const listProperties = async (req, res, next) => {
  try {
    const result = await propertyService.listProperties(req.user.id, req.query, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listPropertyError', err);
    return next(err);
  }
};
