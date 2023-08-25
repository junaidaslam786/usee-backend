import createError from 'http-errors';
import * as propertyService from './property.service';

/**
 * GET /admin/property/list
 * List all properties
 */
export const listProperties = async (req, res, next) => {
  try {
    const result = await propertyService.listProperties(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listPropertyError', err);
    return next(err);
  }
};

/**
 * GET /admin/property/list
 * List all properties
 */
export const listPropertyRemovalRequest = async (req, res, next) => {
  try {
    const result = await propertyService.listPropertyRemovalRequest(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listPropertyError', err); 
    return next(err);
  }
};

/**
 * POST /admin/property/list
 * List all properties
 */
export const approvePropertyRemovalRequest = async (req, res, next) => {
  try {
    const result = await propertyService.approvePropertyRemovalRequest(req.body, req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json({result, message: "Property removed request approved successfully"});
  } catch (err) {
    console.log('removePropertyError', err);
    return next(err);
  }
};