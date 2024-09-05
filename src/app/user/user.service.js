import { mailHelper, utilsHelper } from "@/helpers";
import { EMAIL_TEMPLATE_PATH, EMAIL_SUBJECT, PROPERTY_ROOT_PATHS, USER_TYPE } from '../../config/constants';
import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
const path = require("path");
const ejs = require("ejs");
import { listAgentUsers } from "../agent/user/user.service";

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

    if (reqBody?.latitude && reqBody?.longitude) {
      user.latitude = reqBody.latitude;
      user.longitude = reqBody.longitude;
      const point = db.fn('ST_GeomFromText', `POINT(${reqBody.longitude} ${reqBody.latitude})`, 4326);
      user.geometry = point;
    }

    if (reqBody?.otpVerified) {
      user.otpVerified = reqBody.otpVerified;
    }

    if (reqBody?.otpCode) {
      user.otpCode = reqBody.otpCode;
    }

    if (reqBody?.otpExpiry) {
      user.otpExpiry = reqBody.otpExpiry;
    }

    if (reqBody?.signupStep) {
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

    if (reqBody?.companyPosition || reqBody?.mobileNumber || reqBody?.companyName || reqBody?.companyAddress || reqBody?.zipCode || reqBody?.mortgageAdvisorEmail || reqBody?.ornNumber || req?.files?.companyLogo) {
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

      if (reqBody?.ornNumber) {
        agent.ornNumber = reqBody.ornNumber;
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
  } catch (err) {
    console.log('updateCurrentUserServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const updatePassword = async (user, reqBody) => {
  try {
    const { current, password } = reqBody;

    // Check user password
    const isValidPassword = await user.validatePassword(current);
    if (!isValidPassword) {
      return { error: true, message: 'Current password is incorrect!' }
    }

    // Update password
    user.password = password;
    await user.save();

    return true;
  } catch (err) {
    console.log('updatePasswordServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const createUserWithPassword = async (userData, transaction) => {
  try {
    userData.email = userData.email.toLowerCase();
    return transaction ? await db.models.user.create(userData, { transaction }) : await db.models.user.create(userData);
  } catch (err) {
    console.log('createUserWithPasswordServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const getUserBasicDetails = async (agentUserId, dbInstance) => {
  try {
    const agentUser = await getAgentUserDetailByUserId(agentUserId, dbInstance);
    if (!agentUser) {
      return { error: true, message: "Invalid user id or user do not exist." };
    }

    return agentUser;
  } catch (err) {
    console.log("getAgentUserServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

const getAgentUserDetailByUserId = async (agentUserId, dbInstance) => {
  const agentUser = await dbInstance.agent.findOne({
    where: { userId: agentUserId },
    attributes: ['id', 'userId', 'agentId', 'managerId', 'agentType', 'companyName', 'companyLogo', 'companyAddress', 'companyPosition', 'jobTitle', 'sortOrder'],
    include: [
      {
        model: dbInstance.user,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'profileImage', 'cityName', 'latitude', 'longitude', 'geometry', 'otpVerified', 'otpCode', 'otpExpiry', 'signupStep'],
        include: [
          {
            model: dbInstance.product,
            attributes: ["id", "title", "description", "status"],
          },
          {
            model: dbInstance.productAllocation,
            include: [
              {
                model: dbInstance.product,
                attributes: ["id", "title", "description", "status"],
              },
            ],
          },
          {
            model: dbInstance.agentAccessLevel,
          },
        ],
      },
      {
        model: dbInstance.agentBranch,
        attributes: ["id", "name"],
      },
    ],
  });

  if (!agentUser) {
    return false;
  }

  return agentUser;
};

export const getUserById = async (id) => {
  return await db.models.user.findOne({ where: { id } });
}

export const getUserByEmail = async (email) => {
  return await db.models.user.findOne({ where: { email } });
}

export const listCustomerUsers = async (userInfo, query, dbInstance) => {
  try {
    const searchStr = query?.q ? query.q : "";
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

  } catch (err) {
    console.log('listAgentUsersToAllocateServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const validateOtp = async (user, reqBody) => {
  try {
    const { otp, type } = reqBody;

    if (type === "emailAddress" && otp != user.otpCode) {
      return { error: true, message: 'Otp is incorrect!' }
    }

    user.otpVerified = true;
    user.otpCode = null;
    user.signupStep = 2;
    await user.save();

    return { 
      success: true, 
      message: 'Otp verified successfully.',
      user
    }
  } catch (err) {
    console.log('validateOtpError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const updateTimezone = async (req) => {
  try {
    const { timezone } = req.body;
    let user = req.user;

    user.timezone = timezone;
    await user.save();

    return true;
  } catch (err) {
    console.log('updateTimezoneServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
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
  } catch (err) {
    console.log('getCurrentUserServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
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
      return { error: true, message: 'Unable to upload images.' }
    }

    return await req.dbInstance.userCallBackgroundImage.findAll({
      where: { userId: req.body.userId },
    });
  } catch (err) {
    console.log('uploadCallBackgroundImagesServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
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
  } catch (err) {
    console.log('deleteCallBackgroundImageServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const verifyPassword = async (user, reqBody) => {
  try {
    const { password } = reqBody;

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return { error: true, message: 'Password is incorrect!' }
    }

    return true;
  } catch (err) {
    console.log('verifyPasswordServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deleteUser = async (dbInstance, req) => {
  try {
    const user = req.user;
    if (!user) {
      return { error: true, message: "Invalid user id or user does not exist." };
    }

    const agentUsers = await listAgentUsers(req.user, req.body, dbInstance);

    if (agentUsers.data.length > 0) {
      const transactionResult = await db.transaction(async (transaction) => {
        for (const agentUser of agentUsers.data) {
          await deleteUserAndResources(agentUser.id, dbInstance, transaction);
        }
        await deleteUserAndResources(user.id, dbInstance, transaction);
        await sendDeleteUserEmail(user, dbInstance);
      });

      return transactionResult;
    } else {
      const transactionResult = await db.transaction(async (transaction) => {
        await deleteUserAndResources(user.id, dbInstance, transaction);
        await sendDeleteUserEmail(user, dbInstance);
      });

      return transactionResult;
    }
  } catch (err) {
    console.log("deleteUserServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
}

const sendDeleteUserEmail = async (user, dbInstance) => {
  const emailData = [];
  emailData.name = user.fullName;
  emailData.companyName = user.agent.companyName;
  const htmlData = await ejs.renderFile(
    path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.AGENT_ACCOUNT_DELETION),
    emailData
  );
  const payload = {
    to: user.email,
    subject: `${EMAIL_SUBJECT.AGENT_ACCOUNT_DELETION}`,
    html: htmlData,
  };
  mailHelper.sendMail(payload);
}

export const deleteUserAndResources = async (userId, dbInstance, transaction) => {
  const destroyOperations = [
    dbInstance.userSubscription.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.tokenTransaction.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.token.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.userAlert.destroy({ where: { agentId: userId }, force: true }, { transaction }),
    dbInstance.customerLog.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.customerWishlist.destroy({ where: { customerId: userId }, force: true }, { transaction }),
    dbInstance.product.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.agentAvailability.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.agentBranch.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.productAllocation.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.userCallBackgroundImage.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.agentAccessLevel.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.agent.destroy({ where: { userId }, force: true }, { transaction }),
    dbInstance.user.destroy({ where: { id: userId }, force: true }, { transaction }),
  ];

  return await Promise.all(destroyOperations);
}
