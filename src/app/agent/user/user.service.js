import { 
    AGENT_TYPE, 
    EMAIL_SUBJECT, 
    EMAIL_TEMPLATE_PATH, 
    USER_TYPE, 
} from '@/config/constants';
import { utilsHelper, mailHelper } from '@/helpers';
import db from '@/database';
import * as userService from '../../user/user.service';
const path = require("path")
const ejs = require("ejs");
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import timezoneJson from "../../../../timezones.json";

export const listAgentUsers = async (agentInfo, reqBody, dbInstance) => {
    try {
        const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
        const page = (reqBody && reqBody.page) ? reqBody.page : 1;
        const search = (reqBody && reqBody.search) ? reqBody.search : "";

        const whereClause = agentInfo.agent.agentType == AGENT_TYPE.AGENT ? { agentId: agentInfo.id } : { managerId: agentInfo.id };
        const { count, rows } = await dbInstance.agent.findAndCountAll({
            where: whereClause,
            include: [{ 
                model: dbInstance.user,
                where: {
                    [OP.or]: [
                        { firstName: { [OP.iLike]: `%${search}%` } },
                        { lastName: { [OP.iLike]: `%${search}%` } },
                    ],
                },
                include: [{
                    model: dbInstance.productAllocation,
                },{
                    model: dbInstance.agentAccessLevel,
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

export const listAgentUsersToAllocate = async (req) => {
    try {
        const { user: agentInfo, dbInstance } = req;

        const selectedUser = (req?.query?.user) ? req.query.user : agentInfo.id;
        return await dbInstance.agent.findAll({
            where: { 
                [OP.or]: [
                    { agentId: selectedUser },
                    { managerId: selectedUser }
                ]
            },
            attributes: ["userId"],
            include: [{ 
                model: dbInstance.user,
                attributes: ["firstName", "lastName"]
            }],
            order: [["id", "DESC"]],
        });
    } catch(err) {
        console.log('listAgentUsersToAllocateServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const createAgentUser = async (reqBody, req) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            phoneNumber, 
            role, 
            branch, 
            timezone,
        } = reqBody;
        const { user: agentInfo, dbInstance } = req;
        const { agent, agentTimeSlot, agentAvailability } = dbInstance;

        if (agentInfo.agent.agentType === AGENT_TYPE.STAFF) {
            return { error: true, message: 'You do not have permission to add user.'}
        }

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

            let selectedTimezone = process.env.APP_DEFAULT_TIMEZONE;
            if (timezone) {
                const findTimezone = timezoneJson.find((tz) => tz.value === timezone);
                if (findTimezone) {
                    selectedTimezone = findTimezone.value;
                }
            }

            // create user data
            const newUser = await userService.createUserWithPassword({
                firstName,
                lastName,
                email: email.toLowerCase(), 
                phoneNumber,
                status: true,
                userType: USER_TYPE.AGENT,
                password: tempPassword,
                signupStep: 2,
                otpVerified: true,
                createdBy: agentInfo.id,
                timezone: selectedTimezone,
            }, transaction);

            // create agent user data
            let agentUserData = {
                userId: newUser.id,
                agentId: agentInfo.id,
                agentType: role,
                // branchId: branch,
                companyPosition: role === AGENT_TYPE.MANAGER ? "Manager" : "Staff",
                apiCode: utilsHelper.generateRandomString(10, true),
                sortOrder: sortOrder,
                createdBy: agentInfo.id,
            };

            if (agentInfo.agent.agentType == AGENT_TYPE.MANAGER) {
                agentUserData.agentId = agentInfo.agent.agentId;
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

            // create access levels
            const agentAccessLevels = [];
            for (const [key, value] of Object.entries(reqBody)) {
                if (key.startsWith('accessLevels[')) {
                    agentAccessLevels.push({
                        userId: newUser.id,
                        accessLevel: value,
                    });
                }
            }

            if (agentAccessLevels?.length > 0) {
                await dbInstance.agentAccessLevel.bulkCreate(agentAccessLevels, { transaction });
            }

            const emailData = [];
            emailData.name = newUser.fullName;
            emailData.tempPassword = tempPassword;
            emailData.login = utilsHelper.generateUrl('agent-login', newUser.userType);
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_TEMP_PASSWORD), emailData);
            const payload = {
                to: newUser.email,
                subject: `${EMAIL_SUBJECT.AGENT_ADDED_AS} ${agentUserData.companyPosition}`,
                html: htmlData,
            }
            mailHelper.sendMail(payload);

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
                },{
                    model: dbInstance.agentAccessLevel, 
                }]
            },
            {
                model: dbInstance.agentBranch, 
                attributes: ["id", "name"]
            },
        ],
    });

    if (!agentUser) {
        return false;
    }

    return agentUser;
}

export const updateAgentUser = async (reqBody, req) => {
    try {
        const { 
            userId,
            role, 
        } = reqBody;
        const { user: agentInfo, dbInstance } = req;

        if (agentInfo.agent.agentType === AGENT_TYPE.STAFF) {
            return { error: true, message: 'You do not have permission to update user.'}
        }

        await db.transaction(async (transaction) => {
            const agentUser = await getAgentUserByUserId(userId, dbInstance);

            agentUser.agentType = role;
            await agentUser.save({ transaction });

            if (agentInfo.agentType !== AGENT_TYPE.STAFF) {
                // remove previous access levels
                await dbInstance.agentAccessLevel.destroy({
                    where: {
                        userId: agentUser.userId
                    }
                });

                // create access levels
                const agentAccessLevels = [];
                for (const [key, value] of Object.entries(reqBody)) {
                    if (key.startsWith('accessLevels[')) {
                        agentAccessLevels.push({
                            userId: agentUser.userId,
                            accessLevel: value,
                        });
                    }
                }

                if (agentAccessLevels?.length > 0) {
                    await dbInstance.agentAccessLevel.bulkCreate(agentAccessLevels, { transaction });
                }
            }

            return agentUser;
        });
        
        return true;
    } catch(err) {
        console.log('createAgentUsersServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}