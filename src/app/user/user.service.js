import { utilsHelper } from "@/helpers";
import { PROPERTY_ROOT_PATHS } from '../../config/constants';

export const updateCurrentUser = async (reqBody, req) => {
    try {
        const { user: agentInfo } = req;
        const { city: cityTable } = req.dbInstance;

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
            // Check if city exists
            const isValidCity = await cityTable.findOne({ where: { id: reqBody.city }});
            if (!isValidCity) {
                return { error: true, message: 'Invalid city id!'}
            }
            user.cityId = reqBody.city;
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
        await user.save();

        return true;
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
            return { error: true, message: 'Incorrect password!'}
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