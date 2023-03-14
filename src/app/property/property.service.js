import { PRODUCT_CATEGORIES } from '../../config/constants';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import { PRODUCT_STATUS } from '../../config/constants';

export const listProperties = async (userId, reqBody, dbInstance) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const selectedItems = (reqBody && reqBody.page) ? reqBody.page : 1;
        const status = (reqBody && reqBody.status == PRODUCT_STATUS.ARCHIVED) ? reqBody.status : PRODUCT_STATUS.ACTIVE;
    
        return await dbInstance.product.findAll({
            where: { 
                status, categoryId: PRODUCT_CATEGORIES.PROPERTY,
                [OP.or]: [
                    { userId },
                    { id: { [OP.in]: Sequelize.literal(`(select product_id from product_allocations where allocated_user_id = '${userId}')`) }}
                ]
            },
            order: [["id", "DESC"]],
            offset: (itemPerPage * (selectedItems - 1)),
            limit: itemPerPage
        });
    } catch(err) {
        console.log('listActivePropertiesServiceError', err)
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

export const removePropertyRequest = async (reqUser, reqBody, dbInstance) => {
    try {
        const { propertyId, reasonId, reason } = reqBody;

        const property = await getPropertyById(propertyId, dbInstance);
        if (!property) {
            return { error: true, message: 'Invalid property id or Property do not exist.'}
        }

        property.status = PRODUCT_STATUS.ARCHIVED;
        await property.save();

        await dbInstance.productRemoveRequest.create({
            userId: reqUser.id,
            productId: property.id,
            removeReasonId: reasonId,
            reason,
            status: 0
        });

        return true;
    } catch(err) {
        console.log('removePropertyRequestServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

const getPropertyById = async (propertyId, dbInstance) => {
    const property = await dbInstance.product.findOne({ where: { id: propertyId }});
    if (!property) {
        return false;
    }

    return property;
}

const getPropertyDetailById = async (propertyId, dbInstance) => {
    const property = await dbInstance.product.findOne({
        where: { id: propertyId },
        include: [
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
            attributes: ["id", "key", "value"],
          },
        ],
    });

    if (!property) {
        return false;
    }

    return property;
}