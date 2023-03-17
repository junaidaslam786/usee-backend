import { utilsHelper } from '@/helpers';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import db from '@/database';
import { USER_TYPE, AGENT_TYPE } from '../../config/constants';

const {
    ADMIN_PANEL_URL,
    HOME_PANEL_URL
} = process.env;

export const login = async (reqBody, dbInstance) => {
    try {
        const { email, password } = reqBody;

        // Find user by email address
        const user = await dbInstance.user.findOne({ 
            include: [
                { model: dbInstance.city }, 
                {
                    attributes: ["id", "name"],
                    model: dbInstance.role, as: 'role',
                    include: [{ 
                        model: dbInstance.permission, 
                        attributes: ["id", "name", "key"],
                        through: { attributes: [] }
                    }]
                }
            ],
            where: { email } 
        });
        if (!user) {
            return { error: true, message: 'There is no user with this email address!'}
        }

        if (!user.status) {
            return { error: true, message: 'Account is disabled, please contact admin!'}
        }

        // Check user password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            return { error: true, message: 'Incorrect password!'}
        }

        // Generate and return token
        const token = user.generateToken();
        const refreshToken = user.generateToken('2h');

        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            type: user.userTypeDisplay,
            profileImage: user.profileImage,
            city: user.city ? user.city.name : '',
            role: user.role ? {
                name: user.role.name,
                permissions: user.role.permissions
            } : null   
        };
        return { user: userData, token, refreshToken };
    } catch(err) {
        console.log('loginServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const registerAsAgent = async (reqBody, dbInstance) => {
    try {
        const { user: userTable, agent: agentTable, agentTimeSlot, agentAvailability } = dbInstance;
        const { firstName, lastName, email, password, companyName, companyPosition, phoneNumber } = reqBody;
        
        const result = await db.transaction(async (transaction) => {
            // Create user
            const userData = {
                firstName, 
                lastName, 
                email, 
                password,
                phoneNumber,
                status: 1, 
                userType: USER_TYPE.AGENT,
            }
            const user = await userTable.create(userData, { transaction });

            // create agent profile
            const agent = await agentTable.create({
                userId: user.id,
                companyName, 
                companyPosition,
                agentType: AGENT_TYPE.AGENT, 
                apiCode: utilsHelper.generateRandomString(10, true),
            }, { transaction });

            const timeslots = await agentTimeSlot.findAll();
            for (let day = 1; day <= 7; day++) {
                let agentAvailabilities = [];
                for (const slot of timeslots) {
                    agentAvailabilities.push({
                        userId: user.id,
                        dayId: day,
                        timeSlotId: slot.id,
                        status: true,
                    });
                }
                await agentAvailability.bulkCreate(agentAvailabilities, { transaction });
            }

            // Generate and return tokens
            const token = user.generateToken();
            const refreshToken = user.generateToken('2h');

            const returnedUserData = {
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: agent.companyName,
                companyPosition: agent.companyPosition,
                phoneNumber: user.phoneNumber,
                email: user.email,
                type: user.userTypeDisplay,
            };
            return { user: returnedUserData, token, refreshToken };
        });
       return result;
    } catch(err) {
        console.log('registerAsAgentError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const registerAsCustomer = async (reqBody, dbInstance) => {
    try {
        const { user: userTable } = dbInstance;
        const { firstName, lastName, email, password } = reqBody;

        // Create user
        const userData = {
            firstName, 
            lastName, 
            email, 
            password,
            status: 1, 
            userType: USER_TYPE.CUSTOMER,
        }
        const user = await userTable.create(userData);

        // Generate and return tokens
        const token = user.generateToken();
        const refreshToken = user.generateToken('2h');

        const returnedUserData = {
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            type: user.userTypeDisplay,
        };
        return { user: returnedUserData, token, refreshToken };
    } catch(err) {
        console.log('registerAsCustomerError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const forgotPassword = async (reqBody, dbInstance) => {
    try {
        const { email } = reqBody;
        const userModel = dbInstance.user;

        // Find user by email address
        const user = await userModel.findOne({ where: { email } });
        if (!user) {
            return { error: true, message: 'There is no user with this email address!'}
        }

        if (!user.status) {
            return { error: true, message: 'Account is disabled, contact admin!'}
        }

        // Update remember token in database
        user.rememberToken = utilsHelper.generateRandomString(32);
        user.rememberTokenExpire = new Date();
        await user.save();

        const resetPasswordLink = (user.userType == 'admin' ? ADMIN_PANEL_URL : HOME_PANEL_URL) + `reset-password/${user.rememberToken}`;
        const payload = {
            to: "hassan.mehmood@invozone.com",
            subject: "Your password change request has received",
            html: `<p>Hello,</p> <p>Click on the link below to reset your password</p><p><a href="${resetPasswordLink}" target="_blank">Reset Password</a></p>`
        }
        user.sendMail(payload);

        return true;
    } catch(err) {
        console.log('forgotPasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const resetPassword = async (reqBody, dbInstance) => {
    try {
        const { token, email, password } = reqBody;
        const userModel = dbInstance.user;

        // Find user by email address
        const user = await userModel.findOne({ 
            where: { 
                email, 
                rememberToken: token, 
                rememberTokenExpire: {
                    [OP.lt]: new Date(),
                    [OP.gt]: new Date(new Date() - 1 * 60 * 60 * 1000) // 1 hour
                }
            } 
        });

        if (!user) {
            return { error: true, message: 'Password reset token is invalid or has expired'}
        }
  
        // Update password
        user.rememberToken = null;
        user.rememberTokenExpire = null;
        user.password = password;
        await user.save();
  
        const payload = {
            to: "hassan.mehmood@invozone.com",
            subject: "Your password on Usee360 has been changed",
            html: `<p>Hello,</p> <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`
        }
        user.sendMail(payload);

        return true;
    } catch(err) {
        console.log('resetPasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}