import { USER_ALERT_MODE, USER_ALERT_TYPE } from "@/config/constants";
import db from '@/database';
import * as productService from '../../property/property.service'

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

            const payload = {
                to: product.user.email,
                subject: `Customer has added your property to wishlist`,
                html: `<p>Hello,</p> <p>${customerInfo.firstName} ${customerInfo.lastName} has added your property to wishlist</p> <p>Property Title: ${product.title}</p> <p><img src="${product.featuredImage}"></p></p>`
            }
            customerInfo.sendMail(payload);

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

            const payload = {
                to: product.user.email,
                subject: `Customer has removed your property from wishlist`,
                html: `<p>Hello,</p> <p>${customerInfo.firstName} ${customerInfo.lastName} has removed your property from wishlist</p> <p>Property Title: ${product.title}</p> <p><img src="${product.featuredImage}"></p></p>`
            }
            customerInfo.sendMail(payload);

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