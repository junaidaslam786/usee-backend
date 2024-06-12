import { Sequelize } from 'sequelize';
import { utilsHelper, mailHelper } from '@/helpers';
import db from '@/database';
import { calculateDistance } from '@/helpers/utils';
import { AGENT_TYPE, AGENT_USER_ACCESS_TYPE_VALUE, PRODUCT_STATUS, PRODUCT_CATEGORIES, PROPERTY_ROOT_PATHS, VIRTUAL_TOUR_TYPE, USER_ALERT_MODE, USER_ALERT_TYPE, OFFER_STATUS, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, PRODUCT_LOG_TYPE } from '../../config/constants';
import * as userService from '../user/user.service';
const path = require("path");
const ejs = require("ejs");
const OP = Sequelize.Op;

export const createProperty = async (reqBody, req) => {
  try {
    const { title, description, price, address, city, permitNumber, postalCode, region, latitude, longitude, virtualTourType } = reqBody;
    const { user, dbInstance } = req;

    if (!(user?.agent?.agentType === AGENT_TYPE.AGENT || user?.agentAccessLevels?.find((level) => level.accessLevel === AGENT_USER_ACCESS_TYPE_VALUE.ADD_PROPERTY))) {
      return { error: true, message: 'You do not have permission to add property. ' }
    }

    const videoCallFeature = await dbInstance.feature.findOne({
      where: {
        name: 'Video Call',
      },
      attributes: ['freeUnits']
    });

    const point = db.fn('ST_GeomFromText', `POINT(${longitude} ${latitude})`, 4326);
    const result = await db.transaction(async (transaction) => {
      // create product data
      const productData = {
        userId: user.agent.agentType == AGENT_TYPE.AGENT ? user.id : user.agent.agentId,
        categoryId: PRODUCT_CATEGORIES.PROPERTY,
        title,
        description,
        price,
        virtualTourType,
        address,
        city,
        permitNumber: permitNumber ? permitNumber : null,
        postalCode,
        region,
        latitude,
        longitude,
        status: PRODUCT_STATUS.ACTIVE,
        createdBy: user.id,
        geometry: point,
        freeTimeSlots: videoCallFeature.freeUnits,
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
      if (user.agent.agentType === AGENT_TYPE.MANAGER) {
        allocatedUsers.push({
          productId: product.id,
          userId: user.id,
        });
        allocatedUserIds.push(user.id);
      }

      // allocate this property to the user and its manager since 
      // it is creating property and manager allowed him
      if (user.agent.agentType === AGENT_TYPE.STAFF) {
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

      // qrcode upload
      if (city == 'Dubai' && region == 'United Arab Emirates' && req.files && req.files.qrCode) {
        const qrCodeFile = req.files.qrCode;
        const newFileName = `${Date.now()}_${qrCodeFile.name.replace(/ +/g, "")}`;
        const result = await utilsHelper.fileUpload(qrCodeFile, PROPERTY_ROOT_PATHS.QR_CODE, newFileName);

        if (result?.error) {
          return { error: true, message: result?.error }
        }

        product.qrCode = result;
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
    const { productId, title, description, price, address, city, permitNumber, region, latitude, longitude, virtualTourType } = reqBody;
    const { user, dbInstance } = req;

    if (!(user?.agent?.agentType === AGENT_TYPE.AGENT || user?.agentAccessLevels?.find((level) => level.accessLevel === AGENT_USER_ACCESS_TYPE_VALUE.EDIT_PROPERTY))) {
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
      product.permitNumber = permitNumber;
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

      if (user.agent.agentType !== AGENT_TYPE.STAFF) {
        // remove previous allocations
        await dbInstance.productAllocation.destroy({
          where: {
            productId: product.id
          }
        });

        // create allocated users
        const allocatedUsers = [];
        const allocatedUserIds = [];

        if (user.agent.agentType !== AGENT_TYPE.AGENT) {
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

      // qrcode upload
      if (city == 'Dubai' && region == 'United Arab Emirates' && req.files && req.files.qrCode) {
        const qrCodeFile = req.files.qrCode;
        const newFileName = `${Date.now()}_${qrCodeFile.name.replace(/ +/g, "")}`;
        const result = await utilsHelper.fileUpload(qrCodeFile, PROPERTY_ROOT_PATHS.QR_CODE, newFileName);

        if (result?.error) {
          return { error: true, message: result?.error }
        }

        product.qrCode = result;
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

export const uploadPropertyDocuments = async (req, res) => {
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

export const uploadPropertyImages = async (req, res) => {
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
    const selectedUser = (reqBody && reqBody.user) ? reqBody.user : userId;

    const subscription = await db.models.subscription.findOne({
      where: { name: 'USEE360 Basic' },
    });
    const feature = await db.models.feature.findOne({
      where: { name: 'Video Call' },
    });
    const userSubscription = await db.models.userSubscription.findOne({
      where: { userId, subscriptionId: subscription.id, featureId: feature.id },
    });

    const { count, rows } = await dbInstance.product.findAndCountAll({
      attributes: ['id', 'title', 'price', 'address', 'city', 'region', 'postalCode', 'latitude', 'longitude', 'virtualTourType', 'virtualTourUrl', 'featuredImage', 'soldDate', 'soldTime', 'status', 'createdAt'],
      where: {
        status, categoryId: PRODUCT_CATEGORIES.PROPERTY,
        title: {
          [OP.iLike]: '%' + searchStr + '%'
        },
        [OP.or]: [
          { userId: selectedUser },
          { id: { [OP.in]: Sequelize.literal(`(select product_id from product_allocations where user_id = '${selectedUser}')`) } }
        ]
      },
      include: [
        {
          model: dbInstance.productLog,
          as: 'productViews',
        },
        {
          model: dbInstance.productSubscription,
          attributes: [ 
            'freeRemainingUnits',
            [Sequelize.literal("(SELECT free_units FROM features WHERE name = 'Video Call')"), 'freeTotalUnits'],
          ],
          where: { userSubscriptionId: userSubscription.id },
          required: false,
        }
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

export const getCarbonFootprintDetails = async (propertyId, reqBody, dbInstance) => {
  try {
    const appointmentWiseCarbonFootprint = await dbInstance.appointmentProduct.findAll({
      where: {
        productId: propertyId,
        co2Details: {
          [OP.not]: null,
        },
      },
      attributes: ['id', 'co2Details'],
    });

    const totalCo2SavedValue = appointmentWiseCarbonFootprint.reduce((total, appointment) => {
      return total + parseFloat(appointment.co2Details.co2SavedValue);
    }, 0);
    const totalCo2SavedText = `${totalCo2SavedValue} ${process.env.CO2_UNIT}`;
    console.log('totalCo2SavedValue', totalCo2SavedValue);

    const totalAppointments = appointmentWiseCarbonFootprint.length;
    return {
      appointmentWiseCarbonFootprint,
      totalAppointments,
      totalCo2SavedText,
      totalCo2SavedValue
    };
  } catch (err) {
    console.log('getCarbonFootprintAnalyticsServiceError', err)
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

    const { productId, reasonId, reason } = reqBody;

    const property = await getPropertyById(productId, dbInstance);
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

export const enableAgentSnaglist = async (reqBody, req) => {
  try {
    const { productId, userSubscriptionId } = reqBody;
    const { dbInstance } = req;

    const property = await dbInstance.product.findByPk(productId);
    if (!property) {
      return { error: true, message: 'Invalid property id or Property do not exist.' };
    }

    const snagListFeature = await dbInstance.feature.findOne({ where: { name: 'Snag List' } });
    const propertyListingFeature = await dbInstance.feature.findOne({ where: { name: 'Property Listing' } });

    if (!propertyListingFeature) {
      return {
        error: true,
        message: `Unable to find "${propertyListingFeature.name}" feature, which is a pre-requisite for ${snagListFeature.name} feature.`,
      };
    }
    
    const snagListUserSubscription = await dbInstance.userSubscription.findOne({
      where: {
        id: userSubscriptionId,
        featureId: snagListFeature.id
      }
    });
    if (!snagListUserSubscription) {
      return {
        error: true,
        message: `Could not enable snaglist for ${property.title}. No subscription found for "${snagListFeature.name}" feature.`
      };
    }

    const product = await dbInstance.product.findOne({ where: { id: productId } });
    if (!product) {
      return { error: true, message: 'Invalid property id or Property do not exist.' };
    }

    const productSubscription = await dbInstance.productSubscription.findOrCreate({ where: { userSubscriptionId, productId } });

    if (productSubscription[1]) {
      return { success: true, message: 'Agent snag list enabled successfully.' };
    } else {
      return { error: true, message: 'Agent snag list is already enabled for this property.' };
    }
  } catch (err) {
    console.log('enableAgentSnagListServiceError', err)
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
        const index = product.productMetaTags.findIndex(category => category.categoryField.id === 2)
        product.status = product.productMetaTags[index].value === 'rent' ? PRODUCT_STATUS.RENTED : PRODUCT_STATUS.SOLD;
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
      {
        model: dbInstance.productMetaTag,
        attributes: ["value"],
        include: [
          {
            model: dbInstance.categoryField,
            attributes: ["id", "label", "type", "options", "required"],
          },
        ]
      }
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
        include: [
          {
            model: dbInstance.agent,
            attributes: ["id", "ornNumber"],
          },
        ],
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
      {
        model: dbInstance.productLog,
        as: "productViews",
        // where: {
        //   log_type: "viewed",
        // },
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
      Sequelize.fn('ST_Within', Sequelize.col('product.geometry'), polygon),
      true
    );
    const results = await req.dbInstance.product.findAll({
      where: {
        [OP.and]: [
          whereClause,
          { status: PRODUCT_STATUS.ACTIVE }
        ]
      },
      include: [
        {
          model: req.dbInstance.user,
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
          include: [
            {
              model: req.dbInstance.agent,
              attributes: ["id", "ornNumber"],
            },
          ],
        },
        {
          model: req.dbInstance.productDocument,
          attributes: ["id", "title", "file"],
        },
        {
          model: req.dbInstance.productImage,
          attributes: ["id", "image", "sort_order"],
        },
        {
          model: req.dbInstance.productMetaTag,
          attributes: ["value"],
          include: [
            {
              model: req.dbInstance.categoryField,
              attributes: ["id", "label", "type", "options", "required"],
            },
          ]
        },
        {
          model: req.dbInstance.productOffer,
          attributes: ["id", "amount", "notes", "status", "rejectReason"],
          include: [
            {
              model: req.dbInstance.user,
              attributes: ["id", "firstName", "lastName", "email"],
            },
            {
              model: req.dbInstance.productSnagList,
              attributes: ["id", "agentApproved", "customerApproved"],
              include: [
                {
                  model: req.dbInstance.productSnagListItem,
                  attributes: ["snagKey", "snagValue", ['customer_comment', 'cc'], ['agent_comment', 'ac']],
                },
              ]
            },
          ],
        },
        {
          model: req.dbInstance.productAllocation,
          attributes: ['id'],
          include: [{
            model: req.dbInstance.user,
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: req.dbInstance.productLog,
          as: "productViews",
          // where: {
          //   log_type: "viewed",
          // },
        },
      ],
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
      where: {
        status: PRODUCT_STATUS.ACTIVE
      },
      include: [
        {
          model: req.dbInstance.user,
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
          include: [
            {
              model: req.dbInstance.agent,
              attributes: ["id", "ornNumber"],
            },
          ],
        },
        {
          model: req.dbInstance.productDocument,
          attributes: ["id", "title", "file"],
        },
        {
          model: req.dbInstance.productImage,
          attributes: ["id", "image", "sort_order"],
        },
        {
          model: req.dbInstance.productMetaTag,
          attributes: ["value"],
          include: [
            {
              model: req.dbInstance.categoryField,
              attributes: ["id", "label", "type", "options", "required"],
            },
          ]
        },
        {
          model: req.dbInstance.productOffer,
          attributes: ["id", "amount", "notes", "status", "rejectReason"],
          include: [
            {
              model: req.dbInstance.user,
              attributes: ["id", "firstName", "lastName", "email"],
            },
            {
              model: req.dbInstance.productSnagList,
              attributes: ["id", "agentApproved", "customerApproved"],
              include: [
                {
                  model: req.dbInstance.productSnagListItem,
                  attributes: ["snagKey", "snagValue", ['customer_comment', 'cc'], ['agent_comment', 'ac']],
                },
              ]
            },
          ],
        },
        {
          model: req.dbInstance.productAllocation,
          attributes: ['id'],
          include: [{
            model: req.dbInstance.user,
            attributes: ['id', 'firstName', 'lastName']
          }]
        },
        {
          model: req.dbInstance.productLog,
          as: "productViews",
          // where: {
          //   log_type: "viewed",
          // },
        },
      ],
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
      include: [
        {
          model: req.dbInstance.productLog,
          as: 'productViews',
        },
        {
          model: req.dbInstance.productMetaTag,
          attributes: ["value"],
          include: [
            {
              model: req.dbInstance.categoryField,
              attributes: ["id", "label", "type", "options", "required"],
            },
          ]
        }
      ],
      order: [["id", "DESC"]],
    });

    let arr = [];
    rows.map((el) => {
      if (reqBody.lat && reqBody.lng) {
        if (calculateDistance(el.latitude, el.longitude, reqBody.lat, reqBody.lng) > 5) {
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
      // commercial/residential
      if (reqBody.propertyCategoryType) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 1)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.propertyCategoryType) {
          return
        }
      }
      // rent/sale
      if (reqBody.propertyCategory) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 2)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.propertyCategory) {
          return
        }
      }
      if (reqBody.unit) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 3)
        if (index === -1 || el.productMetaTags[index]?.value !== reqBody.unit) {
          return
        }
      }
      if (reqBody.area) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 4)
        if (index === -1 || parseInt(el.productMetaTags[index]?.value) < parseInt(reqBody.area)) {
          return
        }
      }
      if (reqBody.rooms) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 5)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.rooms) {
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
      if (reqBody.priceType) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 8)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.priceType) {
          return
        }
      }
      if (reqBody.deedTitle) {
        const index = el.productMetaTags.findIndex(category => category.categoryField.id === 9)
        if (index === -1 || el.productMetaTags[index].value !== reqBody.deedTitle) {
          return
        }
      }
      // Office
      // Layout
      if (reqBody.layout) {
        const layoutIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 10);
        if (layoutIndex === -1 || el.productMetaTags[layoutIndex].value !== reqBody.layout) {
          return;
        }
      }
      // Conference Room
      if (reqBody.conferenceRoom) {
        const conferenceRoomIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 11);
        if (conferenceRoomIndex === -1 || el.productMetaTags[conferenceRoomIndex].value !== reqBody.conferenceRoom) {
          return;
        }
      }
      // Conference Room Capacity
      if (reqBody.conferenceRoomCapacity) {
        const conferenceRoomCapacityIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 12);
        if (conferenceRoomCapacityIndex === -1 || el.productMetaTags[conferenceRoomCapacityIndex].value !== reqBody.conferenceRoomCapacity) {
          return;
        }
      }
      // Kitchen
      if (reqBody.kitchen) {
        const kitchenIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 13);
        if (kitchenIndex === -1 || el.productMetaTags[kitchenIndex].value !== reqBody.kitchen) {
          return;
        }
      }

      // Retail
      // Area of Display Window
      if (reqBody.displayWindowArea) {
        const displayWindowAreaIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 14);
        if (displayWindowAreaIndex === -1 || el.productMetaTags[displayWindowAreaIndex].value !== reqBody.displayWindowArea) {
          return;
        }
      }
      // Display Window Type
      if (reqBody.displayWindowType) {
        const displayWindowTypeIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 15);
        if (displayWindowTypeIndex === -1 || el.productMetaTags[displayWindowTypeIndex].value !== reqBody.displayWindowType) {
          return;
        }
      }
      // if Display Window Type = Other
      // Display Window Type Value (Other)
      if (reqBody.displayWindowTypeOther) {
        const displayWindowTypeOtherIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 16);
        if (displayWindowTypeOtherIndex === -1 || el.productMetaTags[displayWindowTypeOtherIndex].value !== reqBody.displayWindowTypeOther) {
          return;
        }
      }

      // Shopping Center
      // Number of Stores
      if (reqBody.numberOfStores) {
        const numberOfStoresIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 17);
        if (numberOfStoresIndex === -1 || el.productMetaTags[numberOfStoresIndex].value !== reqBody.numberOfStores) {
          return;
        }
      }
      // Food Court
      if (reqBody.foodCourt) {
        const foodCourtIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 18);
        if (foodCourtIndex === -1 || el.productMetaTags[foodCourtIndex].value !== reqBody.foodCourt) {
          return;
        }
      }
      // Rest Rooms
      if (reqBody.restRooms) {
        const restRoomsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 19);
        if (restRoomsIndex === -1 || el.productMetaTags[restRoomsIndex].value !== reqBody.restRooms) {
          return;
        }
      }

      // Hotel
      // Number Of Pools
      if (reqBody.numberOfPools) {
        const numberOfPoolsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 20);
        if (numberOfPoolsIndex === -1 || el.productMetaTags[numberOfPoolsIndex].value !== reqBody.numberOfPools) {
          return;
        }
      }
      // Pool Types
      if (reqBody.poolTypes) {
        const poolTypesIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 21);
        if (poolTypesIndex === -1 || el.productMetaTags[poolTypesIndex].value !== reqBody.poolTypes) {
          return;
        }
      }
      // Number of Rooms
      if (reqBody.numberOfRooms) {
        const numberOfRoomsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 22);
        if (numberOfRoomsIndex === -1 || el.productMetaTags[numberOfRoomsIndex].value !== reqBody.numberOfRooms) {
          return;
        }
      }

      // Club
      // Area of Bar (m²)
      if (reqBody.areaOfBar) {
        const areaOfBarIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 23);
        if (areaOfBarIndex === -1 || el.productMetaTags[areaOfBarIndex].value !== reqBody.areaOfBar) {
          return;
        }
      }
      // Area of Lounge (m²)
      if (reqBody.areaOfLounge) {
        const areaOfLoungeIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 24);
        if (areaOfLoungeIndex === -1 || el.productMetaTags[areaOfLoungeIndex].value !== reqBody.areaOfLounge) {
          return;
        }
      }
      // Capacity of VIP Section
      if (reqBody.vipSectionCapacity) {
        const vipSectionCapacityIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 25);
        if (vipSectionCapacityIndex === -1 || el.productMetaTags[vipSectionCapacityIndex].value !== reqBody.vipSectionCapacity) {
          return;
        }
      }
      // Number of Dance Floors
      if (reqBody.numberOfDanceFloors) {
        const numberOfDanceFloorsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 26);
        if (numberOfDanceFloorsIndex === -1 || el.productMetaTags[numberOfDanceFloorsIndex].value !== reqBody.numberOfDanceFloors) {
          return;
        }
      }
      // Number of Private Rooms
      if (reqBody.numberOfPrivateRooms) {
        const numberOfPrivateRoomsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 27);
        if (numberOfPrivateRoomsIndex === -1 || el.productMetaTags[numberOfPrivateRoomsIndex].value !== reqBody.numberOfPrivateRooms) {
          return;
        }
      }

      // Restaurant
      // Area of Kitchen
      if (reqBody.areaOfKitchen) {
        const areaOfKitchenIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 28);
        if (areaOfKitchenIndex === -1 || el.productMetaTags[areaOfKitchenIndex].value !== reqBody.areaOfKitchen) {
          return;
        }
      }
      // Outdoor Seating
      if (reqBody.outdoorSeating) {
        const outdoorSeatingIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 29);
        if (outdoorSeatingIndex === -1 || el.productMetaTags[outdoorSeatingIndex].value !== reqBody.outdoorSeating) {
          return;
        }
      }
      // if Outdoor Seating = Yes
      // Area of Outdoor Seating (m²)
      if (reqBody.areaOfOutdoorSeating) {
        const areaOfOutdoorSeatingIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 30);
        if (areaOfOutdoorSeatingIndex === -1 || el.productMetaTags[areaOfOutdoorSeatingIndex].value !== reqBody.areaOfOutdoorSeating) {
          return;
        }
      }

      // Hotel Room
      // Room Size (m²)
      if (reqBody.roomSize) {
        const roomSizeIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 31);
        if (roomSizeIndex === -1 || el.productMetaTags[roomSizeIndex].value !== reqBody.roomSize) {
          return;
        }
      }
      // Number of Beds
      if (reqBody.numberOfBeds) {
        const numberOfBedsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 32);
        if (numberOfBedsIndex === -1 || el.productMetaTags[numberOfBedsIndex].value !== reqBody.numberOfBeds) {
          return;
        }
      }
      // Room Type
      if (reqBody.roomType) {
        const roomTypeIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 33);
        if (roomTypeIndex === -1 || el.productMetaTags[roomTypeIndex].value !== reqBody.roomType) {
          return;
        }
      }
      // Floor Level
      if (reqBody.floorLevel) {
        const floorLevelIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 34);
        if (floorLevelIndex === -1 || el.productMetaTags[floorLevelIndex].value !== reqBody.floorLevel) {
          return;
        }
      }
      // View
      if (reqBody.view) {
        const viewIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 35);
        if (viewIndex === -1 || el.productMetaTags[viewIndex].value !== reqBody.view) {
          return;
        }
      }
      // Balcony/Terrace
      if (reqBody.balconyTerrace) {
        const balconyTerraceIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 36);
        if (balconyTerraceIndex === -1 || el.productMetaTags[balconyTerraceIndex].value !== reqBody.balconyTerrace) {
          return;
        }
      }

      // Commercial Property Common Features
      // Security Features
      if (reqBody.securityFeatures) {
        const securityFeaturesIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 37);
        if (securityFeaturesIndex === -1 || el.productMetaTags[securityFeaturesIndex].value !== reqBody.securityFeatures) {
          return;
        }
      }
      // if Security Features = Yes
      if (reqBody.securityFeaturesValue) {
        const securityFeaturesValueIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 38);
        if (securityFeaturesValueIndex === -1 || el.productMetaTags[securityFeaturesValueIndex].value !== reqBody.securityFeaturesValue) {
          return;
        }
      }
      // Disability Access
      if (reqBody.disabilityAccess) {
        const disabilityAccessIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 39);
        if (disabilityAccessIndex === -1 || el.productMetaTags[disabilityAccessIndex].value !== reqBody.disabilityAccess) {
          return;
        }
      }
      // Parking Facility
      if (reqBody.parkingFacility) {
        const parkingFacilityIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 40);
        if (parkingFacilityIndex === -1 || el.productMetaTags[parkingFacilityIndex].value !== reqBody.parkingFacility) {
          return;
        }
      }
      // if Parking Facility = Yes
      if (reqBody.parkingFacilityValue) {
        const parkingFacilityValueIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 41);
        if (parkingFacilityValueIndex === -1 || el.productMetaTags[parkingFacilityValueIndex].value !== reqBody.parkingFacilityValue) {
          return;
        }
      }
      // Public Transport Access
      if (reqBody.publicTransportAccess) {
        const publicTransportAccessIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 42);
        if (publicTransportAccessIndex === -1 || el.productMetaTags[publicTransportAccessIndex].value !== reqBody.publicTransportAccess) {
          return;
        }
      }
      // Year Built
      if (reqBody.yearBuilt) {
        const yearBuiltIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 43);
        if (yearBuiltIndex === -1 || el.productMetaTags[yearBuiltIndex].value !== reqBody.yearBuilt) {
          return;
        }
      }
      // Condition
      if (reqBody.condition) {
        const conditionIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 44);
        if (conditionIndex === -1 || el.productMetaTags[conditionIndex].value !== reqBody.condition) {
          return;
        }
      }
      // Availability Date
      if (reqBody.availabilityDate) {
        const availabilityDateIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 45);
        if (availabilityDateIndex === -1 || el.productMetaTags[availabilityDateIndex].value !== reqBody.availabilityDate) {
          return;
        }
      }
      // Pet Friendliness
      if (reqBody.petFriendliness) {
        const petFriendlinessIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 46);
        if (petFriendlinessIndex === -1 || el.productMetaTags[petFriendlinessIndex].value !== reqBody.petFriendliness) {
          return;
        }
      }
      // Additional Features
      if (reqBody.additionalFeatures) {
        const additionalFeaturesIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 47);
        if (additionalFeaturesIndex === -1 || el.productMetaTags[additionalFeaturesIndex].value !== reqBody.additionalFeatures) {
          return;
        }
      }

      // Residential Property Specific Features
      // Apartments
      // Building Amenities
      if (reqBody.buildingAmenities) {
        const buildingAmenitiesIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 48);
        if (buildingAmenitiesIndex === -1 || el.productMetaTags[buildingAmenitiesIndex].value !== reqBody.buildingAmenities) {
          return;
        }
      }
      // House
      // Fireplace
      if (reqBody.fireplace) {
        const fireplaceIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 49);
        if (!el.productMetaTags[fireplaceIndex] || el.productMetaTags[fireplaceIndex].value !== reqBody.fireplace) {
          return;
        }
      }
      // if Fireplace = yes
      // Fireplace Value
      if (reqBody.fireplaceValue) {
        const fireplaceValueIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 50);
        if (fireplaceValueIndex === -1 || el.productMetaTags[fireplaceValueIndex].value !== reqBody.fireplaceValue) {
          return;
        }
      }
      // Number of Floors
      if (reqBody.numberOfFloors) {
        const numberOfFloorsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 51);
        if (numberOfFloorsIndex === -1 || el.productMetaTags[numberOfFloorsIndex].value !== reqBody.numberOfFloors) {
          return;
        }
      }
      // Basement
      if (reqBody.basement) {
        const basementIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 52);
        if (basementIndex === -1 || el.productMetaTags[basementIndex].value !== reqBody.basement) {
          return;
        }
      }

      // Residential Properties Common Features
      // Parking
      if (reqBody.parking) {
        const parkingIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 53);
        if (parkingIndex === -1 || el.productMetaTags[parkingIndex].value !== reqBody.parking) {
          return;
        }
      }
      // if Parking = yes
      // Parking Option
      if (reqBody.parkingOption) {
        const parkingOptionIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 54);
        if (parkingOptionIndex === -1 || el.productMetaTags[parkingOptionIndex].value !== reqBody.parkingOption) {
          return;
        }
      }
      // if Parking Option = Garage/Carport
      // Garage/Carport(No. of Spaces)
      if (reqBody.garageCarport) {
        const garageCarportIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 55);
        if (garageCarportIndex === -1 || el.productMetaTags[garageCarportIndex].value !== reqBody.garageCarport) {
          return;
        }
      }
      // Outdoor Spaces
      if (reqBody.outdoorSpaces) {
        const outdoorSpacesIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 56);
        if (outdoorSpacesIndex === -1 || el.productMetaTags[outdoorSpacesIndex].value !== reqBody.outdoorSpaces) {
          return;
        }
      }
      // Number of Bathrooms
      if (reqBody.numberOfBathrooms) {
        const numberOfBathroomsIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 57);
        if (numberOfBathroomsIndex === -1 || el.productMetaTags[numberOfBathroomsIndex].value !== reqBody.numberOfBathrooms) {
          return;
        }
      }
      // Furnished
      if (reqBody.furnished) {
        const furnishedIndex = el.productMetaTags.findIndex(category => category.categoryField.id === 58);
        if (furnishedIndex === -1 || el.productMetaTags[furnishedIndex].value !== reqBody.furnished) {
          return;
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
    const { productId, logType } = reqBody;
    const { user: userInfo, dbInstance } = req;

    const product = await dbInstance.product.findOne({
      where: { id: productId },
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
      productId: productId,
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

export const uploadFeaturedImage = async (req, res) => {
  try {
    const { productId } = req.body;
    const featuredImage = req?.files?.featuredImage;

    const product = await req.dbInstance.product.findOne({
      where: { id: productId }
    });

    if (!product) {
      return { error: true, message: 'Invalid property id or property do not exist.' };
    }

    const newFileName = `${Date.now()}_${featuredImage.name.replace(/ +/g, "")}`;
    const result = await utilsHelper.fileUpload(featuredImage, PROPERTY_ROOT_PATHS.FEATURE_IMAGE, newFileName);
    if (result?.error) {
      return { error: true, message: result?.error }
    }

    product.featuredImage = result;
    product.save();

    return { success: true, message: 'Featured image saved successfully.', file_path: result }
  } catch (err) {
    console.log('uploadFeaturedImageServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const uploadVirtualTour = async (req, res) => {
  try {
    const { productId, virtualTourType, virtualTourUrl } = req.body;
    const virtualTour = req?.files?.virtualTourVideo;

    const product = await req.dbInstance.product.findOne({
      where: { id: productId }
    });

    if (!product) {
      return { error: true, message: 'Invalid property id or property do not exist.' };
    }

    if (!Object.values(VIRTUAL_TOUR_TYPE).includes(virtualTourType)) {
      return { error: true, message: 'Invalid virtual tour type.' };
    }

    if (virtualTourType === VIRTUAL_TOUR_TYPE.URL && !utilsHelper.isValidUrl(virtualTourUrl)) {
      return { error: true, message: 'Invalid virtual tour url.' };
    }

    if (virtualTour !== undefined && virtualTour === null) {
      if (!utilsHelper.checkFileType(virtualTour, ['.mp4', '.mov', '.mkv'])) {
        return { error: true, message: 'Invalid virtual tour file.' };
      }
    }

    if (virtualTourType === VIRTUAL_TOUR_TYPE.URL) {
      product.virtualTourType = virtualTourType;
      product.virtualTourUrl = virtualTourUrl;
      product.save();

      return { success: true, message: 'Virtual tour url saved successfully.' }
    }

    const newFileName = `${Date.now()}_${virtualTour.name.replace(/ +/g, "")}`;
    console.log('newFileName', newFileName)
    const result = await utilsHelper.fileUpload(virtualTour, PROPERTY_ROOT_PATHS.VIDEO_TOUR, newFileName);
    if (result?.error) {
      return { error: true, message: result?.error }
    }

    product.virtualTourType = virtualTourType;
    product.virtualTourUrl = result;
    product.save();

    return { success: true, message: 'Virtual tour video saved successfully.', file_path: result }
  } catch (err) {
    console.log('uploadVirtualTourServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const uploadQrCode = async (req, res) => {
  try {
    const { productId } = req.body;
    const qrCode = req?.files?.qrCode;

    const product = await req.dbInstance.product.findOne({
      where: { id: productId }
    });

    if (!product) {
      return { error: true, message: 'Invalid property id or property do not exist.' };
    }

    if (qrCode !== undefined && qrCode === null) {
      if (!utilsHelper.checkFileType(qrCode, ['.png', '.jpg', '.jpeg'])) {
        return { error: true, message: 'Invalid qr code file.' };
      }
    }

    const newFileName = `${Date.now()}_${qrCode.name.replace(/ +/g, "")}`;
    const result = await utilsHelper.fileUpload(qrCode, PROPERTY_ROOT_PATHS.QR_CODE, newFileName);
    if (result?.error) {
      return { error: true, message: result?.error }
    }

    product.qrCode = result;
    product.save();

    return { success: true, message: 'Qr code saved successfully.', file_path: result }
  } catch (err) {
    console.log('uploadQrCodeServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}
