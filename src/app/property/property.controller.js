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
 * POST /property/update
 * Update property
 */
export const updateProperty = async (req, res, next) => {
    try {
        const result = await propertyService.updateProperty(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Property updated successfully" });
    } catch (err) {
        console.log('createPropertyError', err);
        next(err);
    }
};

/**
 * POST /property/documents
 * Upload property documents
 */
export const uploadPropertyDocuments = async (req, res, next) => {
    try {
        const result = await propertyService.uploadPropertyDocuments(req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Product documents uploaded successfully" });
    } catch (err) {
        console.log('uploadPropertyDocumentsError', err);
        next(err);
    }
};

/**
 * POST /property/images
 * Upload property images
 */
export const uploadPropertyImages = async (req, res, next) => {
    try {
        const result = await propertyService.uploadPropertyImages(req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Product images uploaded successfully" });
    } catch (err) {
        console.log('uploadPropertyImagesError', err);
        next(err);
    }
};

/**
 * DELETE /property/documents
 * Delete property document
 */
export const deletePropertyDocument = async (req, res, next) => {
    try {
        const result = await propertyService.deletePropertyDocument(req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Product document deleted successfully" });
    } catch (err) {
        console.log('deletePropertyDocumentError', err);
        next(err);
    }
};

/**
 * DELETE /property/images
 * Delete property image
 */
export const deletePropertyImage = async (req, res, next) => {
    try {
        const result = await propertyService.deletePropertyImage(req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Product image deleted successfully" });
    } catch (err) {
        console.log('deletePropertyImageError', err);
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
