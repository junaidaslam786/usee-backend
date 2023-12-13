import createError from 'http-errors';
import * as propertyService from './property.service';

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
 * PUT /property/update
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
 * POST /property/document
 * Upload property documents
 */
export const uploadPropertyDocuments = async (req, res, next) => {
    try {
        const result = await propertyService.uploadPropertyDocuments(req, res);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('uploadPropertyDocumentsError', err);
        next(err);
    }
};

/**
 * POST /property/image
 * Upload property images
 */
export const uploadPropertyImages = async (req, res, next) => {
    try {
        const result = await propertyService.uploadPropertyImages(req, res);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('uploadPropertyImagesError', err);
        next(err);
    }
};

/**
 * DELETE /property/document
 * Delete property document
 */
export const deletePropertyDocument = async (req, res, next) => {
    try {
        const result = await propertyService.deletePropertyDocument(req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Property document deleted successfully" });
    } catch (err) {
        console.log('deletePropertyDocumentError', err);
        next(err);
    }
};

/**
 * DELETE /property/image
 * Delete property image
 */
export const deletePropertyImage = async (req, res, next) => {
    try {
        const result = await propertyService.deletePropertyImage(req.body, req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Property image deleted successfully" });
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

/**
 * POST /property/customer/make-offer
 * Add offer to the property by customer
 */
export const addCustomerOffer = async (req, res, next) => {
    try {
        const result = await propertyService.addCustomerOffer(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Offer has been made successfully" });
    } catch (err) {
        console.log('addCustomerOfferRequestError', err);
        next(err);
    }
};

/**
 * GET /property/agent/update-offer
 * Update the status of the offer by agent
 */
export const updateOfferStatus = async (req, res, next) => {
    try {
        const result = await propertyService.updateOfferStatus(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Offer is updated successfully" });
    } catch (err) {
        console.log('updateOfferStatusError', err);
        next(err);
    }
};

/**
 * GET /property/list-removal-reasons
 * List all removal reasons
 */
export const listRemovalReasons = async (req, res, next) => {
    try {
      const result = await propertyService.listRemovalReasons(req.dbInstance);
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
 * GET /property/to-allocate
 * List all properties created by agent or allocated to this agent to allocate appointment
 */
export const listPropertiesToAllocate = async (req, res, next) => {
    try {
      const result = await propertyService.listPropertiesToAllocate(req.user.id, req.dbInstance);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listPropertiesToAllocateError', err);
      return next(err);
    }
};

/**
 * DELETE /property/customer/offer/:id
 * Delete offer made by customer
 */
export const deleteCustomerOffer = async (req, res, next) => {
    try {
        const result = await propertyService.deleteCustomerOffer((req.params?.id ? req.params?.id : 0), req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Offer deleted successfully" });
    } catch (err) {
        console.log('deleteCustomerOfferError', err);
        next(err);
    }
};

/**
 * POST /property/customer/snag-list
 * Update customer feedback on snag list
 */
export const updateCustomerSnaglist = async (req, res, next) => {
    try {
        const result = await propertyService.updateCustomerSnaglist(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.status(200).json(result);
    } catch (err) {
        console.log('updateCustomerSnaglistError', err);
        next(err);
    }
};

/**
 * POST /property/agent/snag-list
 * Update agent feedback on snag list
 */
export const updateAgentSnaglist = async (req, res, next) => {
    try {
        const result = await propertyService.updateAgentSnaglist(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.status(200).json(result);
    } catch (err) {
        console.log('updateAgentSnaglistError', err);
        next(err);
    }
};

/**
 * GET /property/to-allocate-customer
 * List all properties that is available to customer
 */
export const listPropertiesAllocateToCustomer = async (req, res, next) => {
    try {
      const result = await propertyService.listPropertiesAllocateToCustomer(req.query, req.dbInstance);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }
  
      return res.status(200).json(result);
    } catch (err) {
      console.log('listPropertiesAllocateToCustomerError', err);
      return next(err);
    }
};

/**
 * GET /property/offer/:id
 * Get property offer detail by id
 */
export const getPropertyOffer = async (req, res, next) => {
    try {
        const result = await propertyService.getPropertyOffer((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getPropertyOfferError', err);
        next(err);
    }
};

/**
 * POST /property/log
 * add logs of the property
 */
export const addPropertyLog = async (req, res, next) => {
    try {
        const result = await propertyService.addLog(req.body, req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Property log added successfully" });
    } catch (err) {
        console.log('addPropertyLogError', err);
        next(err);
    }
};

/**
 * DELETE /property/allocated
 * Delete allocated property of a user
 */
export const deleteAllocatedProperty = async (req, res, next) => {
    try {
        const result = await propertyService.deleteAllocatedProperty(req);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        return res.json({ success: true, message: "Allocated property deleted successfully" });
    } catch (err) {
        console.log('deleteAllocatedPropertyError', err);
        next(err);
    }
};