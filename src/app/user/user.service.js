import { utilsHelper } from "@/helpers";
import { PROPERTY_ROOT_PATHS, USER_TYPE } from '../../config/constants';
import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;

export const updateCurrentUser = async (reqBody, req) => {
    try {
        const { user: agentInfo } = req;

        let user = agentInfo;
        
        if (reqBody?.firstName) {
            user.firstName = reqBody.firstName;
        }

        if (reqBody?.lastName) {
            user.lastName = reqBody.lastName;
        }

        if (reqBody?.phoneNumber) {
            user.phoneNumber = reqBody.phoneNumber;
        }

        if (reqBody?.city) {
            user.cityName = reqBody.city;
        }

        if(reqBody?.otpVerified) {
            user.otpVerified = reqBody.otpVerified;
        }

        if (reqBody?.otpCode) {
            user.otpCode = reqBody.otpCode;
        }

        if (reqBody?.otpExpiry) {
            user.otpExpiry = reqBody.otpExpiry;
        }

        if(reqBody?.signupStep) {
            user.signupStep = reqBody.signupStep;
        }

        // profile image upload
        if (req.files && req.files.profileImage) {
            const profileImageFile = req.files.profileImage;
            const newFileName = `${Date.now()}_${profileImageFile.name.replace(/ +/g, "")}`;
            const result = await utilsHelper.fileUpload(profileImageFile, PROPERTY_ROOT_PATHS.PROFILE_LOGO, newFileName);
            if (result?.error) {
                return { error: true, message: result?.error }
            } 

            user.profileImage = result;
        }

        if (reqBody?.companyPosition || reqBody?.mobileNumber || reqBody?.companyName || reqBody?.companyAddress || reqBody?.zipCode || reqBody?.mortgageAdvisorEmail || req?.files?.companyLogo) {
            let agent = user.agent;
            if (reqBody?.companyPosition) {
                agent.companyPosition = reqBody.companyPosition;
            }
    
            if (reqBody?.mobileNumber) {
                agent.mobileNumber = reqBody.mobileNumber;
            }
    
            if (reqBody?.companyName) {
                agent.companyName = reqBody.companyName;
            }
    
            if (reqBody?.companyAddress) {
                agent.companyAddress = reqBody.companyAddress;
            }
    
            if (reqBody?.zipCode) {
                agent.zipCode = reqBody.zipCode;
            }
    
            if (reqBody?.mortgageAdvisorEmail) {
                agent.mortgageAdvisorEmail = reqBody.mortgageAdvisorEmail;
            }
    
            // company logo upload
            if (req.files && req.files.companyLogo) {
                const companyLogoFile = req.files.companyLogo;
                const newFileName = `${Date.now()}_${companyLogoFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(companyLogoFile, PROPERTY_ROOT_PATHS.PROFILE_LOGO, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 
    
                agent.companyLogo = result;
            }
    
            await agent.save();
        }
        
        await user.save();

        // update token
        return user.generateToken();
    } catch(err) {
        console.log('updateCurrentUserServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updatePassword = async (user, reqBody) => {
    try {
        const { current, password } = reqBody;

        // Check user password
        const isValidPassword = await user.validatePassword(current);
        if (!isValidPassword) {
            return { error: true, message: 'Current password is incorrect!'}
        }

        // Update password
        user.password = password;
        await user.save();

        return true;
    } catch(err) {
        console.log('updatePasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const createUserWithPassword = async (userData, transaction) => {
    try {
        userData.email = userData.email.toLowerCase();
        return transaction ? await db.models.user.create(userData, { transaction }) : await db.models.user.create(userData);
    } catch(err) {
        console.log('createUserWithPasswordServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getUserById = async (id) => {
    return await db.models.user.findOne({ where: { id }});
}

export const getUserByEmail = async (email) => {
   return await db.models.user.findOne({ where: { email }});
}

export const listCustomerUsers = async (userInfo, query, dbInstance) => {
    try {
        const searchStr = query?.q ? query.q  : "";
        return await dbInstance.user.findAll({
            where: {
                userType: USER_TYPE.CUSTOMER,
                status: true,
                id: { [OP.ne]: userInfo.id },
                [OP.or]: [
                    { firstName: { [OP.iLike]: `%${searchStr}%` } },
                    { lastName: { [OP.iLike]: `%${searchStr}%` } },
                ]
            },
            attributes: ["id", "firstName", "lastName", "email", "phoneNumber"],
            order: [["id", "DESC"]],
        });
        
    } catch(err) {
        console.log('listAgentUsersToAllocateServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const validateOtp = async (user, reqBody) => {
    try {
        const { otp, type } = reqBody;

        if (type === "emailAddress" && otp != user.otpCode) {
            return { error: true, message: 'Otp is incorrect!'}
        }

        user.otpVerified = true;
        user.otpCode = null;
        user.signupStep = 2;
        await user.save();

        return true;
    } catch(err) {
        console.log('validateOtpError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateTimezone = async (req) => {
    try {
        const { timezone } = req.body;
        let user = req.user;

        user.timezone = timezone;
        await user.save();

        return true;
    } catch(err) {
        console.log('updateTimezoneServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getCurrentUser = async (req) => {
    try {
        const { user: agentInfo, dbInstance } = req;

        const userDetail = await dbInstance.user.findOne({
            where: { id: agentInfo.id },
            include: [
                {
                    attributes: ['id', 'name'],
                    model: dbInstance.role,
                    as: 'role',
                    include: [{
                        model: dbInstance.permission,
                        attributes: ['id', 'name', 'key'],
                        through: { attributes: [] },
                    }],
                },
                {
                    model: dbInstance.agent
                },
                {
                    model: dbInstance.agentAccessLevel
                },
                {
                    model: dbInstance.userCallBackgroundImage
                }
            ],
          });
        return userDetail;
    } catch(err) {
        console.log('getCurrentUserServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const uploadCallBackgroundImages = async (req) => {
    try {
        const userCallBackgroundImages = [];
        const files = req.files.files;
        if (Array.isArray(files)) {
            let totalFiles = files.length;
            for (let i = 0; i < totalFiles; i++) {
                const singleFile = files[i];
                const newFileName = `${Date.now()}_${singleFile.name.replace(/ +/g, "")}`;
                const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.CALL_BACKGROUND_IMAGES, newFileName);
                if (result?.error) {
                    return { error: true, message: result?.error }
                } 
    
                userCallBackgroundImages.push({
                    userId: req.body.userId,
                    name: singleFile.name.replace(/ +/g, ""),
                    url: result,
                });
            }
        } else if (files) {
            const singleFile = files;
            const newFileName = `${Date.now()}_${singleFile.name.replace(/ +/g, "")}`;
            const result = await utilsHelper.fileUpload(singleFile, PROPERTY_ROOT_PATHS.FEATURE_IMAGE, newFileName);
            if (result?.error) {
                return { error: true, message: result?.error }
            } 

            userCallBackgroundImages.push({
                userId: req.body.userId,
                name: singleFile.name.replace(/ +/g, ""),
                url: result,
            });
        }

        if (userCallBackgroundImages.length > 0) {
            await req.dbInstance.userCallBackgroundImage.bulkCreate(userCallBackgroundImages);
        } else {
            return { error: true, message: 'Unable to upload images.'}
        }

        return await req.dbInstance.userCallBackgroundImage.findAll({
            where: { userId: req.body.userId},
        });
    } catch(err) {
        console.log('uploadCallBackgroundImagesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const deleteCallBackgroundImage = async (reqBody, dbInstance) => {
    try {
        const { userId, imageId } = reqBody;

        const imagePath = dbInstance.userCallBackgroundImage.findOne({
            where: {
                userId,
                id: imageId
            }
        });

        await dbInstance.userCallBackgroundImage.destroy({
            where: {
                userId,
                id: imageId
            }
        });

        if (imagePath?.url) {
            utilsHelper.removeFile(imagePath.url);
        }

        return true;
    } catch(err) {
        console.log('deleteCallBackgroundImageServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}