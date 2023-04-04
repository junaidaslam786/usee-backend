import db from '@/database';

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
        const { userId, allAvailable } = reqBody;
        const { agentAvailability, agentTimeSlot } = req.dbInstance;

        await db.transaction(async (transaction) => {
            let agentAvailabilities = [];
            if (allAvailable) {
                await agentAvailability.destroy({ where: { userId } });

                const timeslots = await agentTimeSlot.findAll();
                for (let day = 1; day <= 7; day++) {
                    for (const slot of timeslots) {
                        agentAvailabilities.push({
                            userId,
                            dayId: day,
                            timeSlotId: slot.id,
                            status: true,
                        });
                    }
                }
            } else {
                const { slotDay, timeSlots } = reqBody;
                await agentAvailability.destroy({ where: { userId, dayId: slotDay } });

                for (const slot of timeSlots) {
                    agentAvailabilities.push({
                        userId,
                        dayId: slotDay,
                        timeSlotId: slot,
                        status: true,
                    });
                }
            }
            
            if (agentAvailabilities.length > 0) {
                await agentAvailability.bulkCreate(agentAvailabilities, { transaction });
            }
        });

        return true;
    } catch(err) {
        console.log('updateAgentAvailabilityServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}
