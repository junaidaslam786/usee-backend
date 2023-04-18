import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const listAgentAvailability = async (agentInfo, dbInstance) => {
    try {
        return await dbInstance.agentAvailability.findAll({
            where: { userId: agentInfo.id },
            include: [{
                model: dbInstance.agentTimeSlot,
            }],
            order: ['dayId']
        });
    } catch(err) {
        console.log('listAgentAvailabilityServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateAgentAvailability = async (reqBody, req) => {
    try {
        const { allAvailable, slotDay, timeSlots } = reqBody;
        const { user: agentInfo, dbInstance } = req;
        const { agentAvailability } = dbInstance;

        await db.transaction(async (transaction) => {
            if (allAvailable) {
                // make all slots of the agent as available
                await agentAvailability.update({ status: true }, { 
                    where: { userId: agentInfo.id }
                }, { transaction });
            } else {
                // make all slots of the agent as un available
                const condition = { userId: agentInfo.id, dayId: slotDay };
                await agentAvailability.update({ status: false }, { where: condition }, { transaction });

                // mark all given slots as available
                condition.timeSlotId = { [OP.in]: timeSlots };
                await agentAvailability.update({ status: true }, { where: condition }, { transaction });
            }
        });

        return true;
    } catch(err) {
        console.log('updateAgentAvailabilityServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const listAgentAvailabilitySlots = async (req) => {
    try {
        const { user: agentInfo, dbInstance } = req;

        return await dbInstance.agentTimeSlot.findAll({
            include: [{
                model: dbInstance.agentAvailability,
                where: { userId: (req?.query?.agent ? req.query.agent : agentInfo.id) },
                attributes: []
            }]
        });
    } catch(err) {
        console.log('listAgentAvailabilityServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}
