import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import { USER_ALERT_MODE } from '../../../config/constants';

export const getAgentAlerts = async (userId, dbInstance) => {
    try {
        const alerts = await dbInstance.userAlert.findAll({
            where: { 
                removed: false,
                productId: { [OP.in]: Sequelize.literal(`(select id from products where user_id = '${userId}')`) }
            },
            include: [{
                model: dbInstance.user, 
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

        return formatedAlerts;
    } catch(err) {
        console.log('lgetAgentAlertsServiceError', err)
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

const formatAlertText = (alert) => {
    let text = "";
    const customerName = `<b>${alert.user.firstName} ${alert.user.firstName}</b>`;
    const productTitle = `<b>"${alert.product.title}"</b>`;

    switch(alert.alertMode) {
        case USER_ALERT_MODE.WISHLIST: 
            text = `${customerName} removed the property ${productTitle} from wishlist`;
            if (alert.alertType == 2) {
                text = `${customerName} added the property ${productTitle} to wishlist`;
            }
            
            break;
        case USER_ALERT_MODE.INTEREST: 
            text = `${customerName} is interested in property ${productTitle}`;
            if (alert.alertType == 2) {
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