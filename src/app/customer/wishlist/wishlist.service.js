import { EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH, USER_ALERT_MODE, USER_ALERT_TYPE } from "@/config/constants";
import db from '@/database';
import * as productService from '../../property/property.service'
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

        const wishlist = await getWishlistByUserAndProductId(customerInfo.id, productId, dbInstance);
        if (wishlist) {
            return { error: true, message: 'Already exists in the wishlist.'}
        }

        const result = await db.transaction(async (transaction) => {
            const product = await productService.getPropertyById(productId, dbInstance);

            // add product into the wishlist
            const wishlist = await dbInstance.customerWishlist.create({
                customerId: customerInfo.id,
                productId
            }, { transaction });

            // create agent alert
            await dbInstance.userAlert.create({
                customerId: customerInfo.id,
                productId,
                alertMode: USER_ALERT_MODE.WISHLIST,
                alertType: USER_ALERT_TYPE.WISHLIST_ADDED,
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
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.WISHLIST_ADD), emailData);
            const payload = {
                to: product.user.email,
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
            return { error: true, message: 'Invalid product id or wishlist do not exist.'}
        }

        await db.transaction(async (transaction) => {
            const product = await productService.getPropertyById(productId, dbInstance);

            await dbInstance.customerWishlist.destroy({
                where: {
                    id: wishlist.id
                }
            });

            // create agent alert
            await dbInstance.userAlert.create({
                customerId: customerInfo.id,
                productId,
                alertMode: USER_ALERT_MODE.WISHLIST,
                alertType: USER_ALERT_TYPE.WISHLIST_REMOVED,
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
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.WISHLIST_REMOVE), emailData);
            const payload = {
                to: product.user.email,
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