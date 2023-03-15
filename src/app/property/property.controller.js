import createError from 'http-errors';
import * as propertyService from './property.service';
import { utilsHelper } from '@/helpers';

/**
 * POST /property/create
 * Create property
 */
export const createProperty = async (req, res, next) => {
    try {
        const result = await propertyService.createProperty(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(201).json(result);
    } catch (err) {
        console.log('createPropertyError', err);
        next(err);
    }
};

/**
 * GET /property/list
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

/**
 * POST /property/removal-request
 * Remove property request by agent
 */
export const removePropertyRequest = async (req, res, next) => {
    try {
        const result = await propertyService.removePropertyRequest(req.user, req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Property removal request sent successfully" });
    } catch (err) {
        console.log('removePropertyRequestError', err);
        next(err);
    }
};
