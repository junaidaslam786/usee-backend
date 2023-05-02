import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const getAgentAlerts = async (userId, dbInstance) => {
    try {
        const alerts = await dbInstance.userAlert.findAll({
            where: {
              removed: false,
            },
            include: [
              {
                model: dbInstance.user,
                where: { deletedAt: null },
                attributes: ["id", "firstName", "lastName"],
              },
              {
                model: dbInstance.product,
                where: { userId },
                attributes: ["id", "title"]
              },
            ],
            order: [["id", "DESC"]],
        });

        const alertIds = alerts.map((alert) => alert.id);

        await dbInstance.userAlert.update(
            { viewed: true },
            {
                where: {
                    id: alertIds,
                },
            }
        );

        return alerts;
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
            keyId: reqBody?.keyId ? reqBody?.keyId : null,
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
        },
        {
            model: dbInstance.apppointment, 
            attributes: ["id"],
        }
        ],
    });

    if (!agentAlert) {
        return false;
    }

    return agentAlert;
}