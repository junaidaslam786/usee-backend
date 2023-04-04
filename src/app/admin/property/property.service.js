import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import { PRODUCT_STATUS, PRODUCT_CATEGORIES, PROPERTY_ROOT_PATHS, VIRTUAL_TOUR_TYPE, USER_ALERT_MODE, USER_ALERT_TYPE, OFFER_STATUS, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH } from '../../../config/constants';
import { utilsHelper, mailHelper } from '@/helpers';
import db from '@/database';
import * as userService from '../../user/user.service'
const path = require("path")
const ejs = require("ejs");

export const createProperty = async (reqBody, req) => {
    try {
        const { title, description, price, address, city, postalCode, region, latitude, longitude, virtualTourType } = reqBody;
        const { user, dbInstance } = req;
        const point = db.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`);
        const result = await db.transaction(async (transaction) => {
            // create product data
            const productData = {
                userId: user.id,
                categoryId: PRODUCT_CATEGORIES.PROPERTY,
                title, 
                description, 
                price, 
                virtualTourType,
                address, 
                city, 
                postalCode, 
                region, 
                latitude, 
                longitude, 
                status: PRODUCT_STATUS.ACTIVE,
                createdBy: user.id,
                geometry: point,
                apiCode: utilsHelper.generateRandomString(10, true)
            };
            const product = await dbInstance.product.create(productData, { transaction });

            // create product meta tags
            const metaTags = [];
            const categoryFieldIds = [];
            for (const [key, value] of Object.entries(reqBody)) {
                if (key.startsWith('metaTags[')) {
                    const index = key.match(/\[(\d+)\]/)[1];
                    metaTags.push({
                        productId: product.id,
                        key: index,
                        value
                    });
                    categoryFieldIds.push(index);
                }
            }

            const metaTagsExist = await dbInstance.categoryField.findAndCountAll({ where: { id: categoryFieldIds } });
            if (metaTagsExist && metaTagsExist.count != categoryFieldIds.length) {
                return { error: true, message: 'Invalid meta tags added'}
            }
            await dbInstance.productMetaTag.bulkCreate(metaTags, { transaction });

            /*
            // create allocated users
            const allocatedUsers = [];
            const allocatedUserIds = [];
            for (const [key, value] of Object.entries(reqBody)) {
                if (key.startsWith('allocatedUser[')) {
                    allocatedUsers.push({
                        productId: product.id,
                        userId: value,
                    });
                    allocatedUserIds.push(value);
                }
            }

            const allocatedUserExist = await dbInstance.user.findAndCountAll({ where: { id: allocatedUserIds } });
            if (allocatedUserExist && allocatedUserExist.count != allocatedUserIds.length) {
                return { error: true, message: 'Invalid users added to allocate'}
            }
            await dbInstance.productAllocation.bulkCreate(allocatedUsers, { transaction });
            */

            // feature image upload
            if (req.files && req.files.featuredImage) {
                const featuredImageFile = req.files.featuredImage;
                const newFileName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(featuredImageFile, PROPERTY_ROOT_PATHS.FEATURE_IMAGE, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 

                product.featuredImage = result;
            }

            // virtual tour
            if (virtualTourType == VIRTUAL_TOUR_TYPE.URL) {
                let virtualTourUrl = reqBody.virtualTourUrl;
                if (virtualTourUrl.indexOf('youtube.com') > 0 && virtualTourUrl.indexOf('?v=') > 0) {
                    const videoUrlDetail = videoUrl.split("?v=");
                    if (videoUrlDetail.length > 0 && videoUrlDetail[1]) {
                        virtualTourUrl = `https://www.youtube.com/embed/${videoUrlDetail[1]}`;
                    }
                }

                product.virtualTourUrl = virtualTourUrl;
            } else if (virtualTourType == VIRTUAL_TOUR_TYPE.VIDEO && req.files && req.files.virtualTourVideo) {
                const virtualTourVideoFile = req.files.virtualTourVideo;
                const newFileName = `${Date.now()}_${virtualTourVideoFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(virtualTourVideoFile, PROPERTY_ROOT_PATHS.VIDEO_TOUR, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 

                product.virtualTourUrl = result;
            }

            await product.save({ transaction });

            return product;
        });
        
        return (result.id) ? await getPropertyDetailById(result.id, dbInstance) : result;
    } catch(err) {
        console.log('createPropertyServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateProperty = async (reqBody, req) => {
    try {
        const { productId, title, description, price, address, city, region, latitude, longitude, virtualTourType } = reqBody;
        const { user, dbInstance } = req;

        const point = db.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`);
        const result = await db.transaction(async (transaction) => {
            const product = await getPropertyById(productId, dbInstance);
            
            // update product data
            product.title = title;
            product.description = description;
            product.price = price;
            product.virtualTourType = virtualTourType;
            product.address = address;
            product.city = city;
            product.region = region;
            product.latitude = latitude;
            product.longitude = longitude;
            product.updatedBy = user.id;
            product.geometry = point,
            await product.save({ transaction });

            // remove previous meta tags
            await dbInstance.productMetaTag.destroy({
                where: {
                    productId: product.id
                }
            });

            // create product meta tags
            const metaTags = [];
            const categoryFieldIds = [];
            for (const [key, value] of Object.entries(reqBody)) {
                if (key.startsWith('metaTags[')) {
                    const index = key.match(/\[(\d+)\]/)[1];
                    metaTags.push({
                        productId: product.id,
                        key: index,
                        value
                    });
                    categoryFieldIds.push(index);
                }
            }

            const metaTagsExist = await dbInstance.categoryField.findAndCountAll({ where: { id: categoryFieldIds } });
            if (metaTagsExist && metaTagsExist.count != categoryFieldIds.length) {
                return { error: true, message: 'Invalid meta tags added'}
            }
            await dbInstance.productMetaTag.bulkCreate(metaTags, { transaction });

            // remove previous allocations
            await dbInstance.productAllocation.destroy({
                where: {
                    productId: product.id
                }
            });

            /*
            // create allocated users
            const allocatedUsers = [];
            const allocatedUserIds = [];
            for (const [key, value] of Object.entries(reqBody)) {
                if (key.startsWith('allocatedUser[')) {
                    allocatedUsers.push({
                        productId: product.id,
                        userId: value,
                    });
                    allocatedUserIds.push(value);
                }
            }

            const allocatedUserExist = await dbInstance.user.findAndCountAll({ where: { id: allocatedUserIds } });
            if (allocatedUserExist && allocatedUserExist.count != allocatedUserIds.length) {
                return { error: true, message: 'Invalid users added to allocate'}
            }
            await dbInstance.productAllocation.bulkCreate(allocatedUsers, { transaction });
            */

            // feature image upload
            if (req.files && req.files.featuredImage) {
                const featuredImageFile = req.files.featuredImage;
                const newFileName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(featuredImageFile, PROPERTY_ROOT_PATHS.FEATURE_IMAGE, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 

                product.featuredImage = result;
            }

            // virtual tour
            if (virtualTourType == VIRTUAL_TOUR_TYPE.URL) {
                let virtualTourUrl = reqBody.virtualTourUrl;
                if (virtualTourUrl.indexOf('youtube.com') > 0 && virtualTourUrl.indexOf('?v=') > 0) {
                    const videoUrlDetail = videoUrl.split("?v=");
                    if (videoUrlDetail.length > 0 && videoUrlDetail[1]) {
                        virtualTourUrl = `https://www.youtube.com/embed/${videoUrlDetail[1]}`;
                    }
                }

                product.virtualTourUrl = virtualTourUrl;
            } else if (virtualTourType == VIRTUAL_TOUR_TYPE.VIDEO && req.files && req.files.virtualTourVideo) {
                const virtualTourVideoFile = req.files.virtualTourVideo;
                const newFileName = `${Date.now()}_${virtualTourVideoFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(virtualTourVideoFile, PROPERTY_ROOT_PATHS.VIDEO_TOUR, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 

                product.virtualTourUrl = result;
            }

            await product.save({ transaction });

            return product;
        });
        
        return true;
    } catch(err) {
        console.log('updatePropertyServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const uploadPropertyDocuments = async (req) => {
    try {
        const files = req.files.files;
        const { titles, productId } = req.body;
        let totalFiles = files.length;
        const productDocuments = [];

        for (let i = 0; i < totalFiles; i++) {
            const singleFile = files[i];
            const newFileName = `${Date.now()}_${singleFile.name.replace(/ +/g, "")}`;
            const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.DOCUMENT, newFileName);
            if (result?.error) {
                return { error: true, message: result?.error }
            } 

            productDocuments.push({
                productId,
                title: titles[i],
                file: result,
                createdBy: req.user.id
            });
        }

        if (productDocuments.length > 0) {
            await req.dbInstance.productDocument.bulkCreate(productDocuments);
        }

        return true;
    } catch(err) {
        console.log('uploadPropertyDocumentsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const uploadPropertyImages = async (req) => {
    try {
        const productImages = [];
        const files = req.files.files;
        if (Array.isArray(files)) {
            let totalFiles = files.length;
            for (let i = 0; i < totalFiles; i++) {
                const singleFile = files[i];
                const newFileName = `${Date.now()}_${singleFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.FEATURE_IMAGE, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 
    
                productImages.push({
                    productId: req.body.productId,
                    image: result,
                    sortOrder: i + 1,
                    createdBy: req.user.id
                });
            }
        } else if (files) {
            const singleFile = files;
            const newFileName = `${Date.now()}_${singleFile.name.replace(/ +/g, "")}`;
            const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.FEATURE_IMAGE, newFileName);
            if (result?.error) {
                return { error: true, message: result?.error }
            } 

            productImages.push({
                productId: req.body.productId,
                image: result,
                sortOrder: 1,
                createdBy: req.user.id
            });
        }

        if (productImages.length > 0) {
            await req.dbInstance.productImage.bulkCreate(productImages);
        }

        return await req.dbInstance.productImage.findAll({
            where: { productId: req.body.productId},
            attributes: ["id", "image"],
            order: ["sortOrder"],
        });
    } catch(err) {
        console.log('uploadPropertyImagesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const deletePropertyDocument = async (reqBody, dbInstance) => {
    try {
        const { productId, documentId } = reqBody;

        await dbInstance.productDocument.destroy({
            where: {
                productId,
                id: documentId
            }
        });

        return true;
    } catch(err) {
        console.log('deletePropertyDocumentServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const deletePropertyImage = async (reqBody, dbInstance) => {
    try {
        const { productId, imageId } = reqBody;

        await dbInstance.productImage.destroy({
            where: {
                productId,
                id: imageId
            }
        });

        return true;
    } catch(err) {
        console.log('deletePropertyImageServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const listProperties = async (userId, reqBody, dbInstance) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const page = (reqBody && reqBody.page) ? reqBody.page : 1;
        const status = (reqBody && reqBody.status ) ? reqBody.status : PRODUCT_STATUS.ACTIVE;
    
        const { count, rows } = await dbInstance.product.findAndCountAll({
            where : { status, },
            include: [
                { 
                  model: dbInstance.user, 
                  as: 'user',
                  where: { deletedAt: null },
                  attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
                },
              ],
            
            order: [["id", "DESC"]],
            offset: (itemPerPage * (page - 1)),
            limit: itemPerPage
        });

        return {
            data: rows,
            page,
            size: itemPerPage,
            totalPage: Math.ceil(count / itemPerPage),
            totalItems: count
        };
    } catch(err) {
        console.log('listActivePropertiesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const listPropertiesToAllocate = async (userId, dbInstance) => {
    try {
        return await dbInstance.product.findAll({
            where: { 
                status: PRODUCT_STATUS.ACTIVE, 
                categoryId: PRODUCT_CATEGORIES.PROPERTY,
                [OP.or]: [
                    { userId },
                    { id: { [OP.in]: Sequelize.literal(`(select product_id from product_allocations where user_id = '${userId}')`) }}
                ]
            },
            attributes: ['id', "title"],
            order: [["id", "DESC"]],
        });
    } catch(err) {
        console.log('listPropertiesToAllocateServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getProperty = async (propertyId, dbInstance) => {
    try {
        const property = await getPropertyDetailById(propertyId, dbInstance);
        if (!property) {
            return { error: true, message: 'Invalid property id or Property do not exist.'}
        }

        return property;
    } catch(err) {
        console.log('getPropertyServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const propertyRemovalRequest = async (reqUser, reqBody, dbInstance) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const page = (reqBody && reqBody.page) ? reqBody.page : 1;
        const status = (reqBody && reqBody.status ) ? reqBody.status : PRODUCT_STATUS.ACTIVE;
    
        const { count, rows } = await dbInstance.product.findAndCountAll({
            where: { 
                status
            },
            
            order: [["id", "DESC"]],
            offset: (itemPerPage * (page - 1)),
            limit: itemPerPage
        });

        return {
            data: rows,
            page,
            size: itemPerPage,
            totalPage: Math.ceil(count / itemPerPage),
            totalItems: count
        };
    } catch(err) {
        console.log('listActivePropertiesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const removedPropertyList = async (reqUser, reqBody, dbInstance) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const page = (reqBody && reqBody.page) ? reqBody.page : 1;
        const status = (reqBody && reqBody.status ) ? reqBody.status : PRODUCT_STATUS.ARCHIVED;
    
        const { count, rows } = await dbInstance.product.findAndCountAll({
            where: { 
                status
            },
            
            order: [["id", "DESC"]],
            offset: (itemPerPage * (page - 1)),
            limit: itemPerPage
        });

        return {
            data: rows,
            page,
            size: itemPerPage,
            totalPage: Math.ceil(count / itemPerPage),
            totalItems: count
        };
    } catch(err) {
        console.log('listActivePropertiesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const addCustomerOffer = async (reqBody, req) => {
    try {
        const { productId, amount } = reqBody;
        const { user: customerInfo, dbInstance } = req;

        const notes = reqBody?.notes ? reqBody.notes : "";
        await db.transaction(async (transaction) => {
            const product = await getPropertyById(productId, dbInstance);

            // add offer to the product
            await dbInstance.productOffer.create({
                customerId: customerInfo.id,
                productId,
                amount,
                notes,
                status: OFFER_STATUS.PENDING
            }, { transaction });

            // create agent alert
            await dbInstance.userAlert.create({
                customerId: customerInfo.id,
                productId,
                alertMode: USER_ALERT_MODE.OFFER,
                alertType: USER_ALERT_TYPE.OFFER,
                removed: false,
                viewed: false,
                emailed: false,
                createdBy: customerInfo.id
            }, { transaction });

            const emailData = [];
            emailData.name = product.user.fullName;
            emailData.customerName = customerInfo.fullName;
            emailData.propertyTitle = product.title;
            emailData.propertyImage = product.featuredImage;
            emailData.offerAmount = amount;
            emailData.notes = notes;
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.OFFER), emailData);
            const payload = {
                to: product.user.email,
                subject: EMAIL_SUBJECT.OFFER,
                html: htmlData,
            }
            mailHelper.sendMail(payload);
        });

        return true;
    } catch(err) {
        console.log('addCustomerOfferServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateOfferStatus = async (reqBody, req) => {
    try {
        const { offerId, status } = reqBody;
        const { dbInstance } = req;

        const offer = await dbInstance.productOffer.findOne({ where: { id: offerId } });
        if (!offer) {
            return { error: true, message: 'Invalid offer id or offer do not exist.'}
        }

        if (offer.status != OFFER_STATUS.PENDING) {
            return { error: true, message: 'Offer already updated.'}
        }

        await db.transaction(async (transaction) => {
            const product = await getPropertyById(offer.productId, dbInstance);
            const customer = await userService.getUserById(offer.customerId);

            // update offer status
            offer.status = status == "accepted" ? OFFER_STATUS.ACCEPTED : OFFER_STATUS.REJECTED;
            await offer.save({ transaction });

            const emailData = [];
            emailData.name = customer.fullName;
            emailData.status = status;
            emailData.productTitle = product.title;
            emailData.propertyImage = product.featuredImage;
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.OFFER_UPDATE), emailData);
            const payload = {
                to: customer.email,
                subject: EMAIL_SUBJECT.OFFER_UPDATE,
                html: htmlData,
            }
            mailHelper.sendMail(payload);
        });

        return true;
    } catch(err) {
        console.log('updateOfferStatusServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getPropertyById = async (propertyId, dbInstance) => {
    const property = await dbInstance.product.findOne({ 
        where: { id: propertyId },
        include: [
            {
              model: dbInstance.user, 
              attributes: ["id", "firstName", "lastName", "email"],
            },
        ]
    });
    if (!property) {
        return false;
    }

    return property;
}

export const getPropertyDetailById = async (propertyId, dbInstance) => {
    const property = await dbInstance.product.findOne({
        where: { id: propertyId },
        include: [
            { 
                model: dbInstance.user, 
                as: 'user',
                attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
            },
          {
            model: dbInstance.productDocument, 
            attributes: ["id", "title", "file"],
          },
          {
            model: dbInstance.productImage, 
            attributes: ["id", "image", "sort_order"],
          },
          {
            model: dbInstance.productMetaTag, 
            attributes: ["value"],
            include: [
                {
                  model: dbInstance.categoryField, 
                  attributes: ["id", "label", "type", "options", "required"],
                },
            ]
          },
          {
            model: dbInstance.productOffer, 
            attributes: ["id", "amount", "notes", "status"],
            include: [
                {
                  model: dbInstance.user, 
                  attributes: ["id", "firstName", "lastName", "email"],
                },
            ]
          },
        //   {
        //     model: dbInstance.productAllocation,
        //     attributes: ['id'],
        //     include: [{
        //         model: dbInstance.user,
        //         attributes: ['id', 'firstName', 'lastName']
        //     }]
        //   },
        ],
    });

    if (!property) {
        return false;
    }

    return property;
}

export const listRemovalReasons = async (dbInstance) => {
    try {
        return await dbInstance.productRemoveReason.findAll({
            attributes: ["id", "reason"],
            order: [["id", "DESC"]],
        });
    } catch(err) {
        console.log('listRemovalReasonsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const searchPolygon = async (req) => {
    try {
        const { coordinates } = req.body;

        // to put first coordinate in the end to complete geomtry shape
        if (coordinates) {
            coordinates.push(coordinates[0]);
        }

        const polygonPath = utilsHelper.createPolygonPath(coordinates);
        const polygon = db.fn('ST_GeomFromText', polygonPath, 4326);
        const whereClause = Sequelize.where(
            Sequelize.fn('ST_Within', Sequelize.col('geometry'), polygon),
            true
        );
        const results = await req.dbInstance.product.findAll({
            where: whereClause
        });
        return results;
    } catch(err) {
        console.log('listRemovalReasonsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const searchCircle = async (req) => {
    try {
        const { center, radius } = req.body;
        const conversionFactor = Math.cos((center.lat * Math.PI) / 180.0); // conversion factor based on latitude
        const radiusInDegrees = radius / (111.32 * 1000) / conversionFactor; // convert radius to degrees

        const whereClause = Sequelize.literal(`ST_DWithin(
            ST_GeographyFromText('SRID=4326;POINT(' || longitude || ' ' || latitude || ')'),
            ST_GeographyFromText('SRID=4326;POINT(${center.lng} ${center.lat})'),
            200
          )`);
        const results = await req.dbInstance.product.findAll({
            where: whereClause
        });
        return results;
    } catch(err) {
        console.log('listRemovalReasonsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const listHomePageProperties = async (reqBody, req) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    
        const { count, rows } = await req.dbInstance.product.findAndCountAll({
            where: { 
                status: PRODUCT_STATUS.ACTIVE, 
                categoryId: PRODUCT_CATEGORIES.PROPERTY
            },
            
            order: [["id", "DESC"]],
            offset: (itemPerPage * (page - 1)),
            limit: itemPerPage
        });

        return {
            data: rows,
            page,
            size: itemPerPage,
            totalPage: Math.ceil(count / itemPerPage),
            totalItems: count
        };
    } catch(err) {
        console.log('listActivePropertiesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}