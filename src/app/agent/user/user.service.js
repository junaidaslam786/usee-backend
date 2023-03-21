import { AGENT_TYPE, USER_TYPE } from '@/config/constants';
import { utilsHelper } from '@/helpers';
import db from '@/database';
const {
    HOME_PANEL_URL
} = process.env;
import * as userService from '../../user/user.service';

export const listAgentUsers = async (agentInfo, reqBody, dbInstance) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const page = (reqBody && reqBody.page) ? reqBody.page : 1;

        const whereClause = agentInfo.agent.agentType == AGENT_TYPE.AGENT ? { agentId: agentInfo.id } : { managerId: agentInfo.id };
        const { count, rows } = await dbInstance.agent.findAndCountAll({
            where: whereClause,
            include: [{ 
                model: dbInstance.user,
                include: [{
                    model: dbInstance.productAllocation
                }]
            }],
            order: [["id", "DESC"]],
            offset: (itemPerPage * (page - 1)),
            limit: itemPerPage
        });
        
        return {
            data: rows,
            page,
            size: itemPerPage,
            totalPage: Math.ceil(count / itemPerPage),
            totalItems: count
        };
    } catch(err) {
        console.log('listAgentUsersServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const createAgentUsers = async (reqBody, req) => {
    try {
        const { firstName, lastName, email, phoneNumber, role, branch } = reqBody;
        const { user: agentInfo, dbInstance } = req;
        const { agent, agentTimeSlot, agentAvailability } = dbInstance;

        const result = await db.transaction(async (transaction) => {
            const tempPassword = utilsHelper.generateRandomString(10);

            let sortWhere = { agentId: agentInfo.id };
            if (agentInfo.agent.agentType == AGENT_TYPE.MANAGER) {
                sortWhere = { managerId: agentInfo.id };
            }
            const latestSortOrderData = await dbInstance.agent.findOne({
                attributes: ['sortOrder'],
                where: sortWhere,
                order: [['createdAt', 'desc']],
                limit: 1
            });
            const sortOrder = latestSortOrderData?.sortOrder ? latestSortOrderData.sortOrder + 1 : 1;

            // create user data
            const newUser = await userService.createUserWithPassword({
                firstName,
                lastName,
                email,
                phoneNumber,
                status: true,
                userType: USER_TYPE.AGENT,
                password: tempPassword,
                createdBy: agentInfo.id,
            }, transaction);

            // create agent user data
            let agentUserData = {
                userId: newUser.id,
                agentId: agentInfo.id,
                agentType: role,
                branchId: branch,
                companyPosition: role == AGENT_TYPE.MANAGER ? "Manager" : "Staff",
                apiCode: utilsHelper.generateRandomString(10, true),
                sortOrder: sortOrder,
                createdBy: agentInfo.id,
            };

            if (agentInfo.agent.agentType == AGENT_TYPE.MANAGER) {
                agentUserData.agentId = null;
                agentUserData.managerId = agentInfo.id;
            }
            await agent.create(agentUserData, { transaction });

            const timeslots = await agentTimeSlot.findAll();
            for (let day = 1; day <= 7; day++) {
                let agentAvailabilities = [];
                for (const slot of timeslots) {
                    agentAvailabilities.push({
                        userId: newUser.id,
                        dayId: day,
                        timeSlotId: slot.id,
                        status: true,
                    });
                }
                await agentAvailability.bulkCreate(agentAvailabilities, { transaction });
            }

            const loginLink = HOME_PANEL_URL + 'auth/login';
            const payload = {
                to: "hassan.mehmood@invozone.com",
                subject: `You have been added as ${agentUserData.companyPosition}`,
                html: `<p>Hello,</p> <p>Thank you for registering with us</p> <p>Click on the link below to login with temporary password</p> <p>Your Temporary Password: ${tempPassword}</p> <p><a href="${loginLink}" target="_blank">Login</a></p>`
            }
            console.log('payload', payload);
            newUser.sendMail(payload);

            return newUser;
        });
        
        return (result.id) ? await getAgentUserDetailByUserId(result.id, dbInstance) : result;
    } catch(err) {
        console.log('createAgentUsersServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateAgentUserBranch = async (reqBody, req) => {
    try {
        const { userId, branchId } = reqBody;
        const { user, dbInstance } = req;

        await db.transaction(async (transaction) => {
            const agent = await getAgentUserByUserId(userId, dbInstance);

            agent.branchId = branchId;
            agent.updatedBy = user.id;

            await agent.save({ transaction });
        });
        
        return true;
    } catch(err) {
        console.log('updateAgentUserBranchServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateAgentUserSorting = async (reqBody, req) => {
    try {
        const { userId, sort } = reqBody;
        const { user, dbInstance } = req;

        await db.transaction(async (transaction) => {
            const agent = await getAgentUserByUserId(userId, dbInstance);

            agent.sortOrder = sort;
            agent.updatedBy = user.id;

            console.log("agent", agent);
            await agent.save({ transaction });
        });
        
        return true;
    } catch(err) {
        console.log('updateAgentUserSortingServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getAgentUser = async (agentUserId, dbInstance) => {
    try {
        const agentUser = await getAgentUserDetailByUserId(agentUserId, dbInstance);
        if (!agentUser) {
            return { error: true, message: 'Invalid user id or user do not exist.'}
        }

        return agentUser;
    } catch(err) {
        console.log('getAgentUserServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const deleteAgentUser = async (userId, dbInstance) => {
    try {
        const agentUser = await getAgentUserByUserId(userId, dbInstance);
        if (!agentUser) {
            return { error: true, message: 'Invalid user id or user do not exist.'}
        }

        await db.transaction(async (transaction) => {
            await dbInstance.agent.destroy({
                where: {
                    userId
                }
            }, { transaction });
    
            await dbInstance.user.destroy({
                where: {
                    id: userId
                }
            }, { transaction });
        });

        return true;
    } catch(err) {
        console.log('deleteAgentUserServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

const getAgentUserByUserId = async (agentUserId, dbInstance) => {
    const agentUser = await dbInstance.agent.findOne({where: { userId: agentUserId }});

    if (!agentUser) {
        return false;
    }

    return agentUser;
}

const getAgentUserDetailByUserId = async (agentUserId, dbInstance) => {
    const agentUser = await dbInstance.agent.findOne({
        where: { userId: agentUserId },
        include: [
          {
            model: dbInstance.user, 
            include: [{
                model: dbInstance.productAllocation,
                include: [{
                    model: dbInstance.product,
                    attributes: ["id", "title"]
                }]
            }]
        },
        {
            model: dbInstance.agentBranch, 
            attributes: ["id", "name"]
        }],
    });

    if (!agentUser) {
        return false;
    }

    return agentUser;
}