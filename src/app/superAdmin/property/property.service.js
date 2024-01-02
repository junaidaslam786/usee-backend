import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import {
  PRODUCT_STATUS,
  PRODUCT_CATEGORIES,
  PROPERTY_ROOT_PATHS,
  VIRTUAL_TOUR_TYPE,
  USER_ALERT_MODE,
  USER_ALERT_TYPE,
  OFFER_STATUS,
  EMAIL_SUBJECT,
  EMAIL_TEMPLATE_PATH,
  PRODUCT_LOG_TYPE,
  AGENT_TYPE,
  AGENT_USER_ACCESS_TYPE_VALUE,
  USER_TYPE
} from '@/config/constants';
import { utilsHelper, mailHelper } from '@/helpers';
import db from '@/database';
import * as userService from '../user/user.service'
const path = require("path")
const ejs = require("ejs");
import { calculateDistance } from '@/helpers/utils';

export const createProperty = async (reqBody, req) => {
  try {
    const { title, description, price, address, city, postalCode, region, latitude, longitude, virtualTourType } = reqBody;
    const { user, dbInstance } = req;

    if (!(user?.userType === USER_TYPE.SUPERADMIN || user?.agentAccessLevels?.find((level) => level.accessLevel === AGENT_USER_ACCESS_TYPE_VALUE.ADD_PROPERTY))) {
      return { error: true, message: 'You do not have permission to add property. ' }
    }

    const point = db.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`, 4326);
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
        return { error: true, message: 'Invalid meta tags added' }
      }
      await dbInstance.productMetaTag.bulkCreate(metaTags, { transaction });

      // create allocated users
      const allocatedUsers = [];
      const allocatedUserIds = [];

      // allocate this property to this user since it 
      // is creating property
      if (user?.agent?.agentType === AGENT_TYPE.MANAGER) {
        allocatedUsers.push({
          productId: product.id,
          userId: user.id,
        });
        allocatedUserIds.push(user.id);
      }

      // allocate this property to the user and its manager since 
      // it is creating property and manager allowed him
      if (user?.agent?.agentType === AGENT_TYPE.STAFF) {
        allocatedUsers.push({
          productId: product.id,
          userId: user.id,
        });
        allocatedUserIds.push(user.id);

        if (user?.agent?.managerId) {
          allocatedUsers.push({
            productId: product.id,
            userId: user.agent.managerId,
          });
          allocatedUserIds.push(user.agent.managerId);
        }
      }

      for (const [key, value] of Object.entries(reqBody)) {
        if (key.startsWith('allocatedUser[') && value) {
          allocatedUsers.push({
            productId: product.id,
            userId: value,
          });
          allocatedUserIds.push(value);
        }
      }

      const allocatedUserExist = await dbInstance.user.findAndCountAll({ where: { id: allocatedUserIds } });
      if (allocatedUserExist && allocatedUserExist.count != allocatedUserIds.length) {
        return { error: true, message: 'Invalid users added to allocate' }
      }
      await dbInstance.productAllocation.bulkCreate(allocatedUsers, { transaction });

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
        // if (virtualTourUrl.indexOf('youtube.com') > 0 && virtualTourUrl.indexOf('?v=') > 0) {
        //     const videoUrlDetail = virtualTourUrl.split("?v=");
        //     if (videoUrlDetail.length > 0 && videoUrlDetail[1]) {
        //         virtualTourUrl = `https://www.youtube.com/embed/${videoUrlDetail[1]}`;
        //     }
        // }

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
  } catch (err) {
    console.log('createPropertyServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const updateProperty = async (reqBody, req) => {
  try {
    const { productId, title, description, price, address, city, region, latitude, longitude, virtualTourType } = reqBody;
    const { user, dbInstance } = req;

    if (!(user?.userType === USER_TYPE.SUPERADMIN || user?.agentAccessLevels?.find((level) => level.accessLevel === AGENT_USER_ACCESS_TYPE_VALUE.EDIT_PROPERTY))) {
      return { error: true, message: 'You do not have permission to update property. ' }
    }

    const point = db.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`, 4326);
    await db.transaction(async (transaction) => {
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
        return { error: true, message: 'Invalid meta tags added' }
      }
      await dbInstance.productMetaTag.bulkCreate(metaTags, { transaction });

      if (user?.agent?.agentType !== AGENT_TYPE.STAFF) {
        // remove previous allocations
        await dbInstance.productAllocation.destroy({
          where: {
            productId: product.id
          }
        });

        // create allocated users
        const allocatedUsers = [];
        const allocatedUserIds = [];

        if (user?.agent?.agentType !== AGENT_TYPE.AGENT) {
          allocatedUsers.push({
            productId: product.id,
            userId: user.id,
          });
          allocatedUserIds.push(user.id);
        }

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
          return { error: true, message: 'Invalid users added to allocate' }
        }
        await dbInstance.productAllocation.bulkCreate(allocatedUsers, { transaction });
      }

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
        // if (virtualTourUrl.indexOf('youtube.com') > 0 && virtualTourUrl.indexOf('?v=') > 0) {
        //     const videoUrlDetail = virtualTourUrl.split("?v=");
        //     if (videoUrlDetail.length > 0 && videoUrlDetail[1]) {
        //         virtualTourUrl = `https://www.youtube.com/embed/${videoUrlDetail[1]}`;
        //     }
        // }

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
  } catch (err) {
    console.log('updatePropertyServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const uploadPropertyDocuments = async (req) => {
  try {
    const productDocuments = [];
    const files = req.files.files;
    const { titles, productId } = req.body;
    if (Array.isArray(files)) {
      let totalFiles = files.length;

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
    } else if (files) {
      const singleFile = files;
      const newFileName = `${Date.now()}_${singleFile.name.replace(/ +/g, "")}`;
      const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.DOCUMENT, newFileName);
      if (result?.error) {
        return { error: true, message: result?.error }
      }

      productDocuments.push({
        productId,
        title: titles,
        file: result,
        createdBy: req.user.id
      });
    }

    if (productDocuments.length === 0) {
      return { error: true, message: 'Unable to upload documents.' }
    }

    await req.dbInstance.productDocument.bulkCreate(productDocuments);


    const result = await req.dbInstance.productDocument.findAll({
      where: { productId: req.body.productId },
      attributes: ["id", "title", "file"],
    });

    return result;
  } catch (err) {
    console.log('uploadPropertyDocumentsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const chatAttachment = async (req) => {
  try {

    const singleFile = req.files.featuredImage;
    const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.CHAT_PATH, singleFile.name);

    return result;
  } catch (err) {
    console.log('uploadPropertyDocumentsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
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
    } else {
      return { error: true, message: 'Unable to upload images.' }
    }

    return await req.dbInstance.productImage.findAll({
      where: { productId: req.body.productId },
      attributes: ["id", "image"],
      order: ["sortOrder"],
    });
  } catch (err) {
    console.log('uploadPropertyImagesServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deletePropertyDocument = async (reqBody, dbInstance) => {
  try {
    const { productId, documentId } = reqBody;



    const documentPath = dbInstance.productDocument.findOne({
      where: {
        productId,
        id: documentId
      }
    });

    await dbInstance.productDocument.destroy({
      where: {
        productId,
        id: documentId
      }
    });

    if (documentPath?.file) {
      utilsHelper.removeFile(documentPath.file);
    }

    return true;
  } catch (err) {
    console.log('deletePropertyDocumentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deletePropertyImage = async (reqBody, dbInstance) => {
  try {
    const { productId, imageId } = reqBody;

    const imagePath = dbInstance.productImage.findOne({
      where: {
        productId,
        id: imageId
      }
    });

    await dbInstance.productImage.destroy({
      where: {
        productId,
        id: imageId
      }
    });

    if (imagePath?.image) {
      utilsHelper.removeFile(imagePath.image);
    }

    return true;
  } catch (err) {
    console.log('deletePropertyImageServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const listProperties = async (userId, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    const status = (reqBody && reqBody.status) ? reqBody.status : {
      [OP.notIn]: [PRODUCT_STATUS.SOLD, PRODUCT_STATUS.REMOVED, PRODUCT_STATUS.INACTIVE]
    };
    const searchStr = (reqBody && reqBody.search) ? reqBody.search : "";
    // const selectedUser = (reqBody && reqBody.user) ? reqBody.user : userId;

    const { count, rows } = await dbInstance.product.findAndCountAll({
      where: {
        status, categoryId: PRODUCT_CATEGORIES.PROPERTY,
        title: {
          [OP.iLike]: '%' + searchStr + '%'
        }
      },
      include: [
        {
          model: dbInstance.productLog,
          as: 'productViews',
        },
      ],
      order: [["createdAt", "DESC"]],
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
  } catch (err) {
    console.log('listActivePropertiesServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}
export const listAllProperties = async (userId, reqBody, dbInstance) => {
  try {
    const status = (reqBody && reqBody.status) ? reqBody.status : {
      [OP.notIn]: [PRODUCT_STATUS.SOLD, PRODUCT_STATUS.REMOVED, PRODUCT_STATUS.INACTIVE]
    };
    const searchStr = (reqBody && reqBody.search) ? reqBody.search : "";

    const rows = await dbInstance.product.findAll({
      where: {
        status, categoryId: PRODUCT_CATEGORIES.PROPERTY,
        title: {
          [OP.iLike]: '%' + searchStr + '%'
        }
      },
      include: [
        {
          model: dbInstance.user,
        },
      ],
      order: [["createdAt", "DESC"]]
    });

    return rows;
  } catch (err) {
    console.log('listAllPropertiesServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
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
          { id: { [OP.in]: Sequelize.literal(`(select product_id from product_allocations where user_id = '${userId}')`) } }
        ]
      },
      attributes: ['id', "title"],
      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log('listPropertiesToAllocateServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const getProperty = async (propertyId, dbInstance) => {
  try {
    const property = await getPropertyDetailById(propertyId, dbInstance);
    if (!property) {
      return { error: true, message: 'Invalid property id or Property do not exist.' }
    }

    return property;
  } catch (err) {
    console.log('getPropertyServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const removePropertyRequest = async (reqUser, reqBody, dbInstance) => {
  try {
    if (!(reqUser?.agent?.agentType === AGENT_TYPE.AGENT || reqUser?.agentAccessLevels?.find((level) => level.accessLevel === AGENT_USER_ACCESS_TYPE_VALUE.DELETE_PROPERTY))) {
      return { error: true, message: 'You do not have permission to update property. ' }
    }

    const { propertyId, reasonId, reason } = reqBody;

    const property = await getPropertyById(propertyId, dbInstance);
    if (!property) {
      return { error: true, message: 'Invalid property id or Property do not exist.' }
    }

    property.status = reasonId === 1 ? PRODUCT_STATUS.SOLD : PRODUCT_STATUS.REMOVED;
    if (reasonId === 1) {
      property.soldDate = new Date();
      property.soldTime = Date.now();
    }
    await property.save();

    await dbInstance.productRemoveRequest.create({
      userId: reqUser.id,
      productId: property.id,
      removeReasonId: reasonId,
      reason,
      status: 0
    });

    return true;
  } catch (err) {
    console.log('removePropertyRequestServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const addCustomerOffer = async (reqBody, req) => {
  try {
    const { productId, amount } = reqBody;
    const { user: customerInfo, dbInstance } = req;

    const notes = reqBody?.notes ? reqBody.notes : "";

    const product = await getPropertyById(productId, dbInstance);
    if (product.status === PRODUCT_STATUS.UNDER_OFFER) {
      return { error: true, message: `${process.env.AGENT_ENTITY_LABEL} no longer accepting offers.` }
    }

    const offer = await dbInstance.productOffer.findOne({ where: { customerId: customerInfo.id, productId, status: { [OP.ne]: OFFER_STATUS.REJECTED } } });
    if (offer && offer.status === OFFER_STATUS.ACCEPTED) {
      return { error: true, message: 'Offer is already accepted.' }
    }

    if (offer && offer.status === OFFER_STATUS.PENDING) {
      return { error: true, message: 'Offer is already exists.' }
    }

    await db.transaction(async (transaction) => {
      // add offer to the product
      const productOffer = await dbInstance.productOffer.create({
        customerId: customerInfo.id,
        productId,
        amount,
        notes,
        status: OFFER_STATUS.PENDING
      }, { transaction });

      const productAgentDetail = await getProductAgentDetail(product);

      // create agent alert
      await dbInstance.userAlert.create({
        customerId: customerInfo.id,
        productId,
        agentId: productAgentDetail.id,
        keyId: productOffer.id,
        alertMode: USER_ALERT_MODE.OFFER,
        alertType: USER_ALERT_TYPE.OFFER,
        removed: false,
        viewed: false,
        emailed: false,
        createdBy: customerInfo.id
      }, { transaction });

      const emailData = [];
      emailData.name = productAgentDetail.fullName;
      emailData.customerName = customerInfo.fullName;
      emailData.propertyTitle = product.title;
      emailData.propertyImage = `${process.env.APP_URL}/${product.featuredImage}`;
      emailData.offerAmount = amount;
      emailData.notes = notes;
      emailData.propertyId = product.id;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.OFFER), emailData);
      const payload = {
        to: productAgentDetail.email,
        subject: EMAIL_SUBJECT.OFFER,
        html: htmlData,
      }
      mailHelper.sendMail(payload);
    });

    return true;
  } catch (err) {
    console.log('addCustomerOfferServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const updateOfferStatus = async (reqBody, req) => {
  try {
    const { offerId, status } = reqBody;
    const { dbInstance } = req;

    const offer = await dbInstance.productOffer.findOne({ where: { id: offerId } });
    if (!offer) {
      return { error: true, message: 'Invalid offer id or offer is deleted by customer.' }
    }

    if (offer.status != OFFER_STATUS.PENDING) {
      return { error: true, message: 'Offer already updated.' }
    }

    const result = await processUpdateOffer(offer, dbInstance, status, (reqBody?.reason ? reqBody.reason : ""));
    if (!result) {
      return { error: true, message: 'Server not responding, please try again later.' }
    }

    if (status === OFFER_STATUS.ACCEPTED) {
      await rejectAllOtherOffers({ offerId, productId: offer.productId }, dbInstance);
    }

    return true;
  } catch (err) {
    console.log('updateOfferStatusServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const rejectAllOtherOffers = async (reqBody, dbInstance) => {
  try {
    const { offerId, productId } = reqBody;

    const offers = await dbInstance.productOffer.findAll({
      where: {
        productId,
        id: { [OP.ne]: offerId }
      }
    });

    console.log('offers-to-reject', offers);
    if (offers.length > 0) {
      await Promise.all(
        offers.map((offer) => processUpdateOffer(offer, dbInstance, OFFER_STATUS.REJECTED, "No longer accepting offers."))
      );
    }

    return true;
  } catch (err) {
    console.log('updateOfferStatusServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const processUpdateOffer = async (offer, dbInstance, status, reason) => {
  try {
    await db.transaction(async (transaction) => {
      const product = await getPropertyById(offer.productId, dbInstance);
      const customer = await userService.getUserById(offer.customerId);

      // update offer status
      offer.status = status === OFFER_STATUS.ACCEPTED ? OFFER_STATUS.ACCEPTED : OFFER_STATUS.REJECTED;
      offer.rejectReason = reason;
      await offer.save({ transaction });

      if (product && status === OFFER_STATUS.ACCEPTED) {
        product.status = PRODUCT_STATUS.UNDER_OFFER;
        await product.save();
      }

      const emailData = [];
      emailData.name = customer.fullName;
      emailData.status = status;
      emailData.propertyTitle = product.title;
      emailData.propertyImage = `${process.env.APP_URL}/${product.featuredImage}`;
      emailData.propertyId = product.id;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.OFFER_UPDATE), emailData);
      const payload = {
        to: customer.email,
        subject: EMAIL_SUBJECT.OFFER_UPDATE,
        html: htmlData,
      }
      mailHelper.sendMail(payload);
    });

    return true;
  } catch (err) {
    return false;
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
  if (!propertyId) {
    return false;
  }

  const property = await dbInstance.product.findOne({
    where: { id: propertyId },
    include: [
      {
        model: dbInstance.user,
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
        attributes: ["id", "amount", "notes", "status", "rejectReason"],
        include: [
          {
            model: dbInstance.user,
            attributes: ["id", "firstName", "lastName", "email"],
          },
          {
            model: dbInstance.productSnagList,
            attributes: ["id", "agentApproved", "customerApproved"],
            include: [
              {
                model: dbInstance.productSnagListItem,
                attributes: ["snagKey", "snagValue", ['customer_comment', 'cc'], ['agent_comment', 'ac']],
              },
            ]
          },
        ],
      },
      {
        model: dbInstance.productAllocation,
        attributes: ['id'],
        include: [{
          model: dbInstance.user,
          attributes: ['id', 'firstName', 'lastName']
        }]
      },
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
  } catch (err) {
    console.log('listRemovalReasonsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
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
      where: {
        [OP.and]: [
          whereClause,
          { status: PRODUCT_STATUS.ACTIVE }
        ]
      }
    });
    return results;
  } catch (err) {
    console.log('listRemovalReasonsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const searchCircle = async (req) => {
  try {
    const { center, radius } = req.body;
    const records = await req.dbInstance.product.findAll({
      attributes: ["id", "longitude", "latitude"]
    });

    const nearbyRecords = records.filter(record => {
      const distance = haversine(center.lat, center.lng, record.latitude, record.longitude);
      console.log(distance);
      return distance <= radius / 1000;
    });
    return nearbyRecords;

  } catch (err) {
    console.log('listRemovalReasonsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const listHomePageProperties = async (reqBody, req) => {
  try {
    const whereClause = req?.query?.agentId ? {
      status: PRODUCT_STATUS.ACTIVE,
      categoryId: PRODUCT_CATEGORIES.PROPERTY,
      [OP.or]: [
        { userId: req.query.agentId },
        { id: { [OP.in]: Sequelize.literal(`(select product_id from product_allocations where user_id = '${req.query.agentId}')`) } }
      ]
    }
      : {
        status: PRODUCT_STATUS.ACTIVE,
        categoryId: PRODUCT_CATEGORIES.PROPERTY,
      };

    const { rows } = await req.dbInstance.product.findAndCountAll({
      where: whereClause,
      include: [{
        model: req.dbInstance.productMetaTag,
        attributes: ["value"],
        include: [
          {
            model: req.dbInstance.categoryField,
            attributes: ["id", "label", "type", "options", "required"],
          },
        ]
      }],
      order: [["id", "DESC"]],
    });

    let arr = [];
    rows.map((el) => {
      if (reqBody.lat && reqBody.lng) {
        if (calculateDistance(el.latitude, el.longitude, reqBody.lat, reqBody.lng) > 5) {
          return
        }
      }
      if (reqBody.propertyCategory) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 2)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.propertyCategory) {
          return
        }
      }
      if (reqBody.propertyCategoryType) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 1)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.propertyCategoryType) {
          return
        }
      }
      if (reqBody.propertyType) {
        const id = (reqBody.propertyCategoryType === "commercial") ? 7 : 6
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === id)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.propertyType) {
          return
        }
      }
      if (reqBody.rooms) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 5)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.rooms) {
          return
        }
      }
      if (reqBody.minPrice) {
        if (el.price < reqBody.minPrice) {
          return
        }
      }
      if (reqBody.maxPrice) {
        if (el.price > reqBody.maxPrice) {
          return
        }
      }
      arr.push(el)
    });

    if (reqBody.sort) {
      if (reqBody.sort[1] === "ASC") {
        arr.sort((a, b) => a[reqBody.sort[0]] - b[reqBody.sort[0]])
      } else if (reqBody.sort[1] === "DESC") {
        arr.sort((a, b) => b[reqBody.sort[0]] - a[reqBody.sort[0]])
      }
    }

    const page = (reqBody && reqBody.page) ? reqBody.page : 1
    const perPage = (reqBody && reqBody.size) ? reqBody.size : 10
    const offset = (page - 1) * perPage

    const paginatedArr = arr.slice(offset).slice(0, perPage)
    const totalPages = Math.ceil(arr.length / perPage)

    return {
      data: paginatedArr,
      page: page,
      size: perPage,
      totalPage: totalPages,
      totalItems: arr.length,
    };
  } catch (err) {
    console.log('listActivePropertiesServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deleteCustomerOffer = async (offerId, req) => {
  try {
    const { user, dbInstance } = req;

    const offer = await dbInstance.productOffer.findOne({
      where: {
        id: offerId,
        customerId: user.id
      },
      include: [
        {
          model: dbInstance.product,
          include: [{
            model: dbInstance.user,
            attributes: ["id", "firstName", "lastName", "email"],
          }]
        },
      ]
    });

    if (!offer) {
      return { error: true, message: 'Invalid offer id or offer do not exist.' }
    }

    if (offer.status != OFFER_STATUS.PENDING) {
      return { error: true, message: 'You cannot delete this offer.' }
    }

    // create agent alert
    await dbInstance.userAlert.create({
      customerId: offer.customerId,
      productId: offer.productId,
      agentId: offer.product.user.id,
      keyId: offer.id,
      alertMode: USER_ALERT_MODE.OFFER,
      alertType: USER_ALERT_TYPE.OFFER_DELETED,
      removed: false,
      viewed: false,
      emailed: false,
      createdBy: offer.customerId
    });

    await offer.destroy();

    return true;
  } catch (err) {
    console.log('deleteCustomerOfferError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const updateCustomerSnaglist = async (reqBody, req) => {
  try {
    const { user: customerInfo, dbInstance } = req;
    if (!reqBody?.offerId) {
      return { error: true, message: 'Invalid offer id or offer do not exist.' }
    }

    const offer = await dbInstance.productOffer.findOne({
      where: {
        id: reqBody.offerId,
        customerId: customerInfo.id
      },
      include: [
        {
          model: dbInstance.product,
          include: [{
            model: dbInstance.user,
            attributes: ["id", "firstName", "lastName", "email"],
          }]
        },
      ]
    });

    if (!offer) {
      return { error: true, message: 'Invalid offer id or offer do not exist.' }
    }

    const snagListItems = reqBody?.snagList ? reqBody.snagList : [];
    const isApprovedByCustomer = reqBody?.isApprovedByCustomer ? reqBody.isApprovedByCustomer : false;

    if (snagListItems.length === 0 && !isApprovedByCustomer) {
      return { error: true, message: 'Either approve snag list or update snag list.' }
    }

    const result = await db.transaction(async (transaction) => {
      let snagList = await getOrCreateSnagList(offer.id, dbInstance, transaction);
      snagList.customerApproved = isApprovedByCustomer;
      await snagList.save({ transaction });

      if (snagList?.productSnagListItems && snagListItems) {
        for (const snagListItem of snagList.productSnagListItems) {
          let snagListItemRequest = snagListItems.find((item) => item.value === snagListItem.snagKey);
          await await dbInstance.productSnagListItem.update({
            snagValue: snagListItemRequest.result,
            customerComment: snagListItemRequest.comment
          }, {
            where: { id: snagListItem.id },
            fields: ['snagValue', 'customerComment']
          });
        }
      } else if (snagListItems) {
        const snagListItemToSave = [];
        snagListItems.forEach(async (element) => {
          snagListItemToSave.push({
            snagListId: snagList.id,
            snagKey: element.value,
            snagValue: element.result,
            customerComment: element.comment
          });
        });
        await dbInstance.productSnagListItem.bulkCreate(snagListItemToSave, { transaction });
      }

      // create agent alert
      await dbInstance.userAlert.create({
        customerId: customerInfo.id,
        productId: offer.productId,
        agentId: offer.product.user.id,
        keyId: offer.id,
        alertMode: USER_ALERT_MODE.SNAGLIST,
        alertType: isApprovedByCustomer ? USER_ALERT_TYPE.SNAGLIST_APPROVED : USER_ALERT_TYPE.SNAGLIST_UPDATED,
        removed: false,
        viewed: false,
        emailed: false,
        createdBy: customerInfo.id
      }, { transaction });

      return snagList;
    });

    return (result.id) ? await getSnagListDetailById(result.id, dbInstance) : result;
  } catch (err) {
    console.log('updateCustomerSnaglistServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const updateAgentSnaglist = async (reqBody, req) => {
  try {
    const { user: agentInfo, dbInstance } = req;
    if (!reqBody?.offerId) {
      return { error: true, message: 'Invalid offer id or offer do not exist.' }
    }

    const offer = await dbInstance.productOffer.findOne({
      where: { id: reqBody.offerId },
      include: [{
        model: dbInstance.product,
        attributes: ["title", "featuredImage"]
      },
      {
        model: dbInstance.user,
        attributes: ["firstName", "lastName", "email"]
      }]
    });

    if (!offer) {
      return { error: true, message: 'Invalid offer id or offer do not exist.' }
    }

    const snagListItems = reqBody?.snagList ? reqBody.snagList : [];
    const isApprovedByAgent = reqBody?.isApprovedByAgent ? reqBody.isApprovedByAgent : false;

    if (snagListItems.length === 0 && !isApprovedByAgent) {
      return { error: true, message: 'Either approve snag list or update snag list.' }
    }

    const result = await db.transaction(async (transaction) => {
      let snagList = await getOrCreateSnagList(offer.id, dbInstance, transaction);
      snagList.agentApproved = isApprovedByAgent;
      await snagList.save({ transaction });

      if (snagList?.productSnagListItems && snagListItems) {
        for (const snagListItem of snagList.productSnagListItems) {
          let snagListItemRequest = snagListItems.find((item) => item.value === snagListItem.snagKey);
          await await dbInstance.productSnagListItem.update({
            snagValue: snagListItemRequest.result,
            agentComment: snagListItemRequest.comment
          }, {
            where: { id: snagListItem.id },
            fields: ['snagValue', 'agentComment']
          });
        }
      } else if (snagListItems) {
        const snagListItemToSave = [];
        snagListItems.forEach(async (element) => {
          snagListItemToSave.push({
            snagListId: snagList.id,
            snagKey: element.value,
            snagValue: element.result,
            agentComment: element.comment
          });
        });
        await dbInstance.productSnagListItem.bulkCreate(snagListItemToSave, { transaction });
      }

      if (offer?.user?.email) {
        const emailData = [];
        emailData.name = `${offer.user.firstName} ${offer.user.lastName}`;
        emailData.status = isApprovedByAgent ? "approved" : "updated";
        emailData.propertyId = offer.productId;
        emailData.propertyTitle = offer.product.title;
        emailData.propertyImage = `${process.env.APP_URL}/${offer.product.featuredImage}`;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.SNAGLIST_UPDATE), emailData);
        const payload = {
          to: offer.user.email,
          subject: isApprovedByAgent ? EMAIL_SUBJECT.SNAGLIST_APPROVE : EMAIL_SUBJECT.SNAGLIST_UPDATE,
          html: htmlData,
        }
        mailHelper.sendMail(payload);
      }

      return snagList;
    });

    return (result.id) ? await getSnagListDetailById(result.id, dbInstance) : result;
  } catch (err) {
    console.log('updateAgentSnaglistServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

const getOrCreateSnagList = async (offerId, dbInstance, transaction) => {
  let snagList = await dbInstance.productSnagList.findOne({
    where: { offerId },
    include: [{
      model: dbInstance.productSnagListItem
    }]
  });

  if (snagList) {
    return snagList;
  }

  return await dbInstance.productSnagList.create({
    offerId,
    agentApproved: false,
    customerApproved: false
  }, { transaction });
}

export const getSnagListDetailById = async (snagListId, dbInstance) => {
  const property = await dbInstance.productSnagList.findOne({
    where: { id: snagListId },
    include: [
      {
        model: dbInstance.productSnagListItem,
      },
      {
        model: dbInstance.productOffer,
        attributes: ["id", "amount", "notes", "status", "rejectReason"],
        include: [
          {
            model: dbInstance.user,
            attributes: ["id", "firstName", "lastName", "email"],
          },
        ],
      },
    ],
  });

  if (!property) {
    return false;
  }

  return property;
}

export const listPropertiesAllocateToCustomer = async (query, dbInstance) => {
  try {
    const searchStr = query?.q ? query.q : "";
    return await dbInstance.product.findAll({
      where: {
        status: PRODUCT_STATUS.ACTIVE,
        categoryId: PRODUCT_CATEGORIES.PROPERTY,
        [OP.and]: [
          { title: { [OP.iLike]: `%${searchStr}%` } },
        ]
      },
      attributes: ["id", "title", "userId"],
      order: [["id", "DESC"]],
    });
  } catch (err) {
    console.log('listPropertiesAllocateToCustomerServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const getPropertyOffer = async (offerId, dbInstance) => {
  try {
    const propertyOffer = await dbInstance.productOffer.findOne({
      where: {
        id: offerId
      },
    });

    if (!propertyOffer) {
      return { error: true, message: 'Invalid offer id or Offer do not exist.' }
    }

    return propertyOffer;
  } catch (err) {
    console.log('getPropertyOfferError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const addLog = async (reqBody, req) => {
  try {
    const { id, logType } = reqBody;
    const { user: userInfo, dbInstance } = req;

    const product = await dbInstance.product.findOne({
      where: { id },
      attributes: ['id']
    });

    if (!product) {
      return { error: true, message: 'Invalid property id or property do not exist.' };
    }

    if (!Object.values(PRODUCT_LOG_TYPE).includes(logType)) {
      return { error: true, message: 'Invalid log type.' };
    }

    const productLogObject = {
      userId: userInfo.id,
      productId: id,
      userType: userInfo.userType,
      logType,
    };

    const existingProductLog = await dbInstance.productLog.findOne({
      where: productLogObject
    });

    if (!existingProductLog) {
      // Create product log
      await dbInstance.productLog.create(productLogObject);
    }

    return true;
  } catch (err) {
    console.log('addLogServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deleteAllocatedProperty = async (req) => {
  try {
    const { productId, userId } = req.body;

    // check if this product is allocated to the user
    const productAllocated = await req.dbInstance.productAllocation.findOne({
      where: {
        productId,
        userId
      }
    });

    // if not allocated then check and remove the property
    if (!productAllocated) {
      const product = await req.dbInstance.product.findOne({
        where: {
          id: productId,
          userId
        }
      });

      if (product) {
        product.status = PRODUCT_STATUS.REMOVED;
        await product.save();
      }

      return true;
    }

    await req.dbInstance.productAllocation.destroy({
      where: {
        productId,
        userId
      }
    });

    return true;
  } catch (err) {
    console.log('deleteAllocatedPropertyServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deleteProperty = async (req) => {
  try {
    const { propertyId } = req.body;
    const idToDelete = req.params.id || propertyId;

    // remove the property
    const product = await req.dbInstance.product.findOne({
      where: {
        id: idToDelete
      }
    });

    if (product) {
      product.status = PRODUCT_STATUS.REMOVED;
      product.deleted_at = Date.now();
      await product.save();
    }

    return true;
  } catch (err) {
    console.log('deletePropertyServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const getProductAgentDetail = async (product) => {
  let productAgentDetail = product.user;

  // It means owner of the product is agent 
  // while product is created by its manager or staff
  if (product.createdBy !== product.user.id) {
    productAgentDetail = await db.models.user.findOne({
      where: { id: product.createdBy }
    });

    // if the person created the product removed or not active
    // by agent then agent itself will get the details
    if (!productAgentDetail || (!productAgentDetail?.status)) {
      productAgentDetail = product.user;
    }
  }

  return productAgentDetail;
}

export const listPropertyRemovalRequest = async (dbInstance) => {
  try {
    const { count, rows } = await dbInstance.productRemoveRequest.findAndCountAll({
      where: { status: { [Op.eq]: false } },

      include: [
        {
          model: dbInstance.product,
          as: 'product',
          include: [
            {
              model: dbInstance.user,
              as: 'user',
              where: { deletedAt: null },
              attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
            },
          ],
        },

      ],

      order: [['id', 'DESC']],
    });

    return {
      data: rows,
      totalItems: count,
    };
  } catch (err) {
    console.log('listPropertiesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const approvePropertyRemovalRequest = async (reqBody, dbInstance) => {
  try {
    const { propertyId, reasonId } = reqBody;

    const property = await getPropertyById(propertyId, dbInstance);
    if (!property) {
      return { error: true, message: 'Invalid property id or Property do not exist.' };
    }
    property.status = true;
    property.status = PRODUCT_STATUS.REMOVED;

    await property.save();
    return true;
  } catch (err) {
    console.log('approvePropertyRemovalServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

// Define the Haversine formula function
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

// Define a function to convert degrees to radians
function degToRad(degrees) {
  return degrees * (Math.PI / 180);
}
