import { EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, USER_ALERT_MODE, USER_ALERT_TYPE, USER_TYPE } from "@/config/constants";
import db from '@/database';
import * as productService from '../../property/property.service';
import * as userService from '../../user/user.service';
const path = require("path")
const ejs = require("ejs");
import { mailHelper, utilsHelper } from "@/helpers";

export const listWishlist = async (customerInfo, dbInstance) => {
    try {
        return await dbInstance.customerWishlist.findAll({
            where: { customerId: customerInfo.id },
            include: [{
                model: dbInstance.product,
                attributes: ["id", "title", "description", "featuredImage", "address", "city", "postalCode", "region"],
            }],
            order: [['id', 'desc']]
        });
    } catch(err) {
        console.log('listWishlistServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const addProductToWishlist = async (productId, req) => {
    try {
        const { user: customerInfo, dbInstance } = req;
        let customerDetails = customerInfo;
        let isNewCustomer = false;
        const tempPassword = utilsHelper.generateRandomString(10);

        const result = await db.transaction(async (transaction) => {
            if (!customerDetails) {
                customerDetails = await userService.createUserWithPassword({
                    firstName: req.customerFirstName,
                    lastName: req.customerLastName,
                    email: req.customerEmail.toLowerCase(),
                    password: tempPassword,
                    status: true,
                    userType: USER_TYPE.CUSTOMER,
                }, transaction);

                isNewCustomer = true;
            }

            if (!customerDetails) {
                return { error: true, message: 'No customer exist to add wishlist.'}
            }

            const existingWishlist = await getWishlistByUserAndProductId(customerDetails.id, productId, dbInstance);
            if (existingWishlist) {
                return { error: true, message: 'Already exists in the wishlist.'}
            }

            const product = await productService.getPropertyById(productId, dbInstance);
            if (!product) {
                return { error: true, message: 'Invalid property or property do not exist.'}
            }

            // add product into the wishlist
            const wishlist = await dbInstance.customerWishlist.create({
                customerId: customerDetails.id,
                productId
            }, { transaction });

            const productAgentDetail = productService.getProductAgentDetail(product);

            // create agent alert
            await dbInstance.userAlert.create({
                customerId: customerDetails.id,
                productId,
                agentId: productAgentDetail.id, 
                alertMode: USER_ALERT_MODE.WISHLIST,
                alertType: USER_ALERT_TYPE.WISHLIST_ADDED,
                removed: false,
                viewed: false,
                emailed: false,
                createdBy: customerDetails.id
            }, { transaction });

            if (isNewCustomer) {
                const emailNewData = [];
                emailNewData.name = customerDetails.fullName;
                emailNewData.tempPassword = tempPassword;
                emailNewData.login = utilsHelper.generateUrl('customer-login', USER_TYPE.CUSTOMER);
                const htmlNewData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_TEMP_PASSWORD), emailNewData);
                const newPayload = {
                    to: customerDetails.email,
                    subject: EMAIL_SUBJECT.AGENT_ADDED_CUSTOMER,
                    html: htmlNewData,
                }
                mailHelper.sendMail(newPayload);
            }

            const emailData = [];
            emailData.name = productAgentDetail.fullName;
            emailData.customerName = customerDetails.fullName;
            emailData.propertyTitle = product.title;
            emailData.propertyImage = product.featuredImage;
            emailData.propertyImage = `${process.env.APP_URL}/${product.featuredImage}`;
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.WISHLIST_ADD), emailData);
            const payload = {
                to: productAgentDetail.email,
                subject: EMAIL_SUBJECT.WISHLIST_ADD,
                html: htmlData,
            }
            mailHelper.sendMail(payload);

            return wishlist;
        });
  
        return (result.id) ? await getWishlistDetailById(result.id, dbInstance) : result;
    } catch(err) {
        console.log('addProductToWishlistServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const removeProductFromWishlist = async (productId, req) => {
    try {
        const { user: customerInfo, dbInstance } = req;

        const wishlist = await getWishlistByUserAndProductId(customerInfo.id, productId, dbInstance);
        if (!wishlist) {
            return { error: true, message: 'Invalid wishlist id or wishlist do not exist.'}
        }

        await db.transaction(async (transaction) => {
            const product = await productService.getPropertyById(productId, dbInstance);

            await dbInstance.customerWishlist.destroy({
                where: {
                    id: wishlist.id
                }
            });

            const productAgentDetail = productService.getProductAgentDetail(product);

            // create agent alert
            await dbInstance.userAlert.create({
                customerId: customerInfo.id,
                productId,
                agentId: productAgentDetail.id,
                alertMode: USER_ALERT_MODE.WISHLIST,
                alertType: USER_ALERT_TYPE.WISHLIST_REMOVED,
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
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.WISHLIST_REMOVE), emailData);
            const payload = {
                to: productAgentDetail.email,
                subject: EMAIL_SUBJECT.WISHLIST_REMOVE,
                html: htmlData,
            }
            mailHelper.sendMail(payload);

            return wishlist;
        });
  
        return true;
    } catch(err) {
        console.log('removeProductFromWishlistServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getWishlistByUserAndProductId = async (customerId, productId, dbInstance) => {
    const wishlist = await dbInstance.customerWishlist.findOne({
        where: { 
            customerId,
            productId
        }
    });
  
    if (!wishlist) {
      return false;
    }
  
    return wishlist;
}

export const getWishlistDetailById = async (id, dbInstance) => {
    const wishlist = await dbInstance.customerWishlist.findOne({
        where: { id },
        include: [{
            model: dbInstance.product,
            attributes: ["id", "title", "description", "featuredImage", "address", "city", "postalCode", "region"],
        }],
    });
  
    if (!wishlist) {
      return false;
    }
  
    return wishlist;
}