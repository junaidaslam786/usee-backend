import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import db from '@/database';
import { USER_TYPE, AGENT_TYPE, EMAIL_SUBJECT, EMAIL_TEMPLATE_PATH } from '@/config/constants';
import { PROPERTY_ROOT_PATHS } from '@/config/constants';
import * as userService from '../user/user.service';
import { mailHelper, utilsHelper } from '@/helpers';
const path = require("path")
const ejs = require("ejs");
import timezoneJson from "../../../timezones.json";

export const login = async (reqBody, dbInstance) => {
    try {
        const { email, password, type } = reqBody;

        let userType = USER_TYPE.ADMIN;
        if (type === USER_TYPE.AGENT) {
            userType = USER_TYPE.AGENT;
        }

        if (type === USER_TYPE.CUSTOMER) {
            userType = USER_TYPE.CUSTOMER;
        }

        // Find user by email address
        const user = await dbInstance.user.findOne({ 
            include: [
                { 
                    model: dbInstance.agent, 
                    attributes: ["jobTitle", "agentType"],
                },
                { 
                    model: dbInstance.agentAccessLevel, 
                },
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
            where: { email: email.toLowerCase(), userType } 
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
        // const refreshToken = user.generateToken('4h');

        const userData = {
            id: user.id,
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
            } : null,
            signupStep: user.signupStep,
            otpVerified: user.otpVerified,
            timezone: user.timezone,
            userType: user.userType 
        };

        return { user: userData, token };
    } catch(err) {
        console.log('loginServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const registerAsAgent = async (req, reqBody, dbInstance) => {
    try {
        const { agent: agentTable, agentTimeSlot, agentAvailability } = dbInstance;
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            companyName, 
            companyPosition, 
            phoneNumber, 
            jobTitle,
            timezone
        } = reqBody;
        
        let selectedTimezone = process.env.APP_DEFAULT_TIMEZONE;
        const result = await db.transaction(async (transaction) => {
            if (timezone) {
                const findTimezone = timezoneJson.find((tz) => tz.value === timezone);
                if (findTimezone) {
                    selectedTimezone = findTimezone.value;
                }
            }

            // Create user
            const user = await userService.createUserWithPassword({
                firstName, 
                lastName, 
                email: email.toLowerCase(), 
                password,
                phoneNumber,
                status: 1, 
                userType: USER_TYPE.AGENT,
                signupStep: reqBody?.signupStep ? reqBody.signupStep : 0,
                otpCode: reqBody?.otpCode ? reqBody.otpCode : null,
                otpExpiry: reqBody?.otpExpiry ? reqBody.otpExpiry : null,
                timezone: selectedTimezone,
            }, transaction);

            let agentPayload = {
                userId: user.id,
                companyName, 
                companyPosition,
                jobTitle,
                licenseNo: reqBody?.licenseNo ? reqBody.licenseNo : "",
                agentType: AGENT_TYPE.AGENT, 
                apiCode: utilsHelper.generateRandomString(10, true)
            }

            if (req.files && req.files.document) {
                const documentFile = req.files.document;
                const newFileName = `${Date.now()}_${documentFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(documentFile, PROPERTY_ROOT_PATHS.PROFILE_DOCUMENT, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                }
                agentPayload.documentUrl = result;
            }

            // create agent profile
            const agent = await agentTable.create(agentPayload, { transaction });

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
            const token = user.generateToken('4h', agent);
            // const refreshToken = user.generateToken('4h');

            const returnedUserData = {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                companyName: agent.companyName,
                companyPosition: agent.companyPosition,
                phoneNumber: user.phoneNumber,
                email: user.email,
                type: user.userTypeDisplay,
                userType: user.userType
            };

            const emailData = [];
            emailData.name = user.fullName;
            emailData.login = utilsHelper.generateUrl('agent-login', user.userType);
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_AGENT), emailData);
            const payload = {
                to: user.email,
                subject: EMAIL_SUBJECT.REGISTER_AGENT,
                html: htmlData,
            }
            mailHelper.sendMail(payload);

            return { user: returnedUserData, token };
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
        const { firstName, lastName, email, phoneNumber, password, timezone } = reqBody;

        let selectedTimezone = process.env.APP_DEFAULT_TIMEZONE;
        if (timezone) {
            const findTimezone = timezoneJson.find((tz) => tz.value === timezone);
            if (findTimezone) {
                selectedTimezone = findTimezone.value;
            }
        }

        // Create user
        const userData = {
            firstName, 
            lastName, 
            email: email.toLowerCase(),
            phoneNumber, 
            password,
            status: 1, 
            userType: USER_TYPE.CUSTOMER,
            signupStep: reqBody?.signupStep ? reqBody.signupStep : 0,
            otpCode: reqBody?.otpCode ? reqBody.otpCode : null,
            otpExpiry: reqBody?.otpExpiry ? reqBody.otpExpiry : null,
            timezone: selectedTimezone,
        }
        const user = await userTable.create(userData);

        // Generate and return tokens
        const token = user.generateToken();
        const refreshToken = user.generateToken('4h');

        const returnedUserData = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            email: user.email,
            type: user.userTypeDisplay,
            userType: user.userType
        };

        const emailData = [];
        emailData.name = user.fullName;
        emailData.login = utilsHelper.generateUrl('customer-login', user.userType);
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_CUSTOMER), emailData);
        const payload = {
            to: user.email,
            subject: EMAIL_SUBJECT.REGISTER_CUSTOMER,
            html: htmlData,
        }
        mailHelper.sendMail(payload);

        return { user: returnedUserData, token, refreshToken };
    } catch(err) {
        console.log('registerAsCustomerError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const forgotPassword = async (reqBody, dbInstance) => {
    try {
        const { email, type } = reqBody;
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

        const emailData = [];
        emailData.name = user.fullName;
        emailData.resetPasswordLink = `${utilsHelper.generateUrl((type == 'agent' ? 'agent-reset-password' : 'customer-reset-password'), user.userType)}/${user.rememberToken}`;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.FORGOT_PASSWORD), emailData);
        const payload = {
            to: email,
            subject: EMAIL_SUBJECT.FORGOT_PASSWORD,
            html: htmlData,
        }
        mailHelper.sendMail(payload);

        return true;
    } catch(err) {
        console.log('forgotPasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const resetPassword = async (reqBody, dbInstance) => {
    try {
        const { token, password, type } = reqBody;
        const userModel = dbInstance.user;

        // Find user by email address
        const user = await userModel.findOne({ 
            where: { 
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
  
        const emailData = [];
        emailData.name = user.fullName;
        emailData.email = user.email;
        emailData.login = utilsHelper.generateUrl((type == 'agent' ? 'agent-login' : 'customer-login'), user.userType);
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.RESET_PASSWORD), emailData);
        const payload = {
            to: user.email,
            subject: EMAIL_SUBJECT.RESET_PASSWORD,
            html: htmlData,
        }
        mailHelper.sendMail(payload);

        return true;
    } catch(err) {
        console.log('resetPasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const sendOtp = async (req) => {
    try {
        const { userId, otpExpiry } = req.body;
        const { dbInstance } = req;

        const otp = Math.floor(100000 + Math.random() * 900000);
        const user = await dbInstance.user.findOne({ where: { id: userId }});
        user.otpCode = otp;

        if (otpExpiry) {
            user.otpExpiry = otpExpiry;
        }
        await user.save();

        const emailData = [];
        emailData.name = `${user.firstName} ${user.lastName}`;
        emailData.otp = otp;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.SEND_OTP), emailData);
        const payload = {
            to: user.email,
            subject: EMAIL_SUBJECT.SEND_OTP,
            html: htmlData,
        };
        mailHelper.sendMail(payload);

        return true;
    } catch(err) {
        console.log('sendOtpError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const checkFieldExists = async (reqBody, dbInstance) => {
    try {
        const { email, phone } = reqBody;
        const userModel = dbInstance.user;

        if (email) {
            // Find user by email address
            const user = await userModel.findOne({ where: { email } });
            if (user) {
                return { error: true, message: 'Email address already exist.'}
            }
        }

        if (phone) {
            // Find user by phone number
            const user = await userModel.findOne({ where: { phoneNumber: phone } });
            if (user) {
                return { error: true, message: 'Phone number already exist.'}
            }
        }

        return true;
    } catch(err) {
        console.log('checkFieldExistsServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}