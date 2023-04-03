import createError from 'http-errors';
import * as propertyService from '../../property/property.service';

/**
 * GET /home/property/search-polygon
 * List all properties based on polygon search coordinates
 */
export const searchPolygon = async (req, res, next) => {
    try {
        const result = await propertyService.searchPolygon(req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json(result);
    } catch (err) {
        console.log('updateOfferStatusError', err);
        next(err);
    }
};

/**
 * GET /home/property/search-circle
 * List all properties based on circle search coordinates
 */

export const searchCircle = async (req, res, next) => {
    try {
        const result = await propertyService.searchCircle(req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json(result);
    } catch (err) {
        console.log('updateOfferStatusError', err);
        next(err);
    }
};

/**
 * POST /home/property/list
 * List all properties for home page
 */
export const listHomePageProperties = async (req, res, next) => {
    try {
      const result = await propertyService.listHomePageProperties(req.body, req);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listHomePagePropertiesError', err);
      return next(err);
    }
};

/**
 * GET /property/:id
 * Get property detail by id
 */
export const getProperty = async (req, res, next) => {
    try {
        const result = await propertyService.getProperty((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getPropertyError', err);
        next(err);
    }
};