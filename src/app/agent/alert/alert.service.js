import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import { USER_ALERT_MODE, USER_ALERT_TYPE } from '../../../config/constants';

export const getAgentAlerts = async (userId, dbInstance) => {
    try {
        const alerts = await dbInstance.userAlert.findAll({
            where: { 
                removed: false,
                productId: { [OP.in]: Sequelize.literal(`(select id from products where user_id = '${userId}')`) }
            },
            include: [{
                model: dbInstance.user, 
                where: { deletedAt: null },
                attributes: ["id", "firstName", "lastName"],
            },
            {
                model: dbInstance.product, 
                attributes: ["id", "title"],
            }],
            order: [["id", "DESC"]],
        });

        const formatedAlerts = [];
        const alertIds = [];

        for(const alert of alerts) {
            alertIds.push(alert.id);
            formatedAlerts.push({
                id: alert.id,
                text: formatAlertText(alert),
                createdAt: alert.createdAt
            });
        }

        await dbInstance.userAlert.update({ viewed: true }, {
            where: {
                id: alertIds
            }
        });

        return formatedAlerts
    } catch(err) {
        console.log('getAgentAlertsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getAgentUnReadAlertCounts = async (userId, dbInstance) => {
    try {
        const unReadAlertCounts = await dbInstance.userAlert.count({
            where: { 
                viewed: false,
                productId: { [OP.in]: Sequelize.literal(`(select id from products where user_id = '${userId}')`) }
            },
        });

        return unReadAlertCounts;
    } catch(err) {
        console.log('getAgentUnReadAlertCountsError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const createAgentAlert = async (reqBody, req) => {
    try {
        const { user: customerInfo, dbInstance } = req;
        const {
            productId,
            alertMode,
            alertType
        } = reqBody;

        // create agent alert
        const agentAlert = await dbInstance.userAlert.create({
            customerId: customerInfo.id,
            productId,
            alertMode,
            alertType,
            removed: false,
            viewed: false,
            emailed: false,
            createdBy: customerInfo.id
        });

        return await getAgentAlertDetailById(agentAlert.id, dbInstance);
    } catch(err) {
        console.log('createAgentAlertServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const removeAgentAlert = async (alertId, dbInstance) => {
    try {
        const userAlert = await dbInstance.userAlert.findOne({ where: { id: alertId } });
        if (!userAlert) {
            return { error: true, message: 'Invalid alert id or alert do not exist.'}
        }

        await dbInstance.userAlert.destroy({
            where: {
                id: alertId
            }
        });

        return true;
    } catch(err) {
        console.log('removeAgentAlertServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getAgentAlertDetailById = async (id, dbInstance) => {
    const agentAlert = await dbInstance.userAlert.findOne({
        where: { id },
        include: [{
            model: dbInstance.user, 
            attributes: ["id", "firstName", "lastName"],
        },
        {
            model: dbInstance.product, 
            attributes: ["id", "title"],
        }],
    });

    if (!agentAlert) {
        return false;
    }

    return agentAlert;
}

const formatAlertText = (alert) => {
    let text = "";
    const customerName = `<b>${alert.user.firstName} ${alert.user.lastName}</b>`;
    const productTitle = `<b>"${alert.product.title}"</b>`;

    switch(alert.alertMode) {
        case USER_ALERT_MODE.WISHLIST: 
            text = `${customerName} removed the property ${productTitle} from wishlist`;
            if (alert.alertType == USER_ALERT_TYPE.WISHLIST_ADDED) {
                text = `${customerName} added the property ${productTitle} to wishlist`;
            }
            
            break;
        case USER_ALERT_MODE.INTEREST: 
            text = `${customerName} is interested in property ${productTitle}`;
            if (alert.alertType == USER_ALERT_TYPE.NOT_INTERESTED) {
                text = `${customerName} is not interested in property ${productTitle}`;
            }

            break;
        case USER_ALERT_MODE.OFFER: 
            text = `${customerName} made an offer for the property ${productTitle}`;

            break;
        default:
            break;
    }
    
    return text;
}