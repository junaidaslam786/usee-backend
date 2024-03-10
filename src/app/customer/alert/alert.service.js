import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const getCustomerAlerts = async (userId, dbInstance) => {
    try {
        const alerts = await dbInstance.userAlert.findAll({
            where: {
                customerId: userId,
                removed: false,
            },
            include: [
              {
                model: dbInstance.user,
                as: 'customerAlertUser',
                where: { deletedAt: null },
                attributes: ["id", "firstName", "lastName"],
              },
              {
                model: dbInstance.user,
                as: 'AgentAlertUser',
                where: { deletedAt: null },
                attributes: ["id", "firstName", "lastName"],
              },
              {
                model: dbInstance.product,
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
        console.log('getCustomerAlertsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getCustomerUnReadAlertCounts = async (userId, dbInstance) => {
    try {
        const unReadAlertCounts = await dbInstance.userAlert.count({
            where: { 
                viewed: false,
                customerId: userId
            },
        });

        return unReadAlertCounts;
    } catch(err) {
        console.log('getCustomerUnReadAlertCountsError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const createCustomerAlert = async (reqBody, req) => {
    try {
        const { user: customerInfo, dbInstance } = req;
        const {
            customerId,
            productId,
            alertMode,
            alertType
        } = reqBody;

        // create customer alert
        const customerAlert = await dbInstance.userAlert.create({
            customerId: customerInfo.id,
            productId,
            customerId,
            keyId: reqBody?.keyId ? reqBody?.keyId : null,
            alertMode,
            alertType,
            removed: false,
            viewed: false,
            emailed: false,
            createdBy: customerInfo.id
        });

        return await getCustomerAlertDetailById(customerAlert.id, dbInstance);
    } catch(err) {
        console.log('createCustomerAlertServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const removeCustomerAlert = async (alertId, dbInstance) => {
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
        console.log('removeCustomerAlertServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getCustomerAlertDetailById = async (id, dbInstance) => {
    const customerAlert = await dbInstance.userAlert.findOne({
        where: { id },
        include: [
        {
            model: dbInstance.user, 
            as: 'customerAlertUser',
            attributes: ["id", "firstName", "lastName"],
        },
        {
            model: dbInstance.user, 
            as: 'CustomerAlertUser',
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

    if (!customerAlert) {
        return false;
    }

    return customerAlert;
}