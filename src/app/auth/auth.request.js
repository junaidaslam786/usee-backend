/* eslint-disable no-return-await */
import { body, check } from 'express-validator';
import db from '@/database';

export const loginRules = [
  body('email').isEmail().withMessage('Please provide valid email address').exists()
    .withMessage('Please provide email address'),
  body('password').exists().withMessage('Please provide password'),
];

export const agentOnboardingRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('companyName').exists().withMessage('Please provide company name').notEmpty()
    .withMessage('Please provide company name'),
  body('companyPosition').exists().withMessage('Please provide company position').notEmpty()
    .withMessage('Please provide company position'),
  body('cityName').exists().withMessage('Please provide city name').notEmpty()
    .withMessage('Please provide city name'),
  body('countryName').exists().withMessage('Please provide country name').notEmpty()
    .withMessage('Please provide country name'),
  body('jobTitle').exists().withMessage('Please provide job title').notEmpty()
    .withMessage('Please provide job title'),
  body('licenseNo').exists().withMessage('Please provide company registration # or deed title').notEmpty()
    .withMessage('Please provide company registration # or deed title'),
  body('ornNumber').custom((value, { req }) => {
    const isDubaiUAE = req.body.cityName === 'Dubai' && req.body.countryName === 'United Arab Emirates';

    const isDeveloper = req.body.jobTitle.toLowerCase() === 'developer';

    if (isDubaiUAE && isDeveloper) {
      if (!value) {
        throw new Error('ORN number is required for developers in Dubai, United Arab Emirates');
      }
    }

    return true;
  }),
  body('phoneNumber')
    .exists().withMessage('Please provide phone number')
    .notEmpty()
    .withMessage('Please provide phone number')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line consistent-return
      return await db.models.user.findOne({ where: { phoneNumber: value } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Phone number already exist.');
        }
      });
    }),
  body('email')
    .isEmail().withMessage('Please provide valid email address')
    .exists()
    .withMessage('Please provide valid email address')
    .notEmpty()
    .withMessage('Please provide valid email address'),
];

export const customerOnboardingRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  // body('cityName').exists().withMessage('Please provide city name').notEmpty()
  //   .withMessage('Please provide city name'),
  // body('countryName').exists().withMessage('Please provide country name').notEmpty()
  //   .withMessage('Please provide country name'),
  // body('jobTitle').exists().withMessage('Please provide job title').notEmpty()
  //   .withMessage('Please provide job title'),
  // body('licenseNo').exists().withMessage('Please provide company registration # or deed title').notEmpty()
  //   .withMessage('Please provide company registration # or deed title'),
  // body('ornNumber').custom((value, { req }) => {
  //   const isDubaiUAE = req.body.cityName === 'Dubai' && req.body.countryName === 'United Arab Emirates';

  //   const isDeveloper = req.body.jobTitle.toLowerCase() === 'developer';

  //   if (isDubaiUAE && isDeveloper) {
  //     if (!value) {
  //       throw new Error('ORN number is required for developers in Dubai, United Arab Emirates');
  //     }
  //   }

  //   return true;
  // }),
  body('phoneNumber')
    .exists().withMessage('Please provide phone number')
    .notEmpty()
    .withMessage('Please provide phone number')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line consistent-return
      return await db.models.user.findOne({ where: { phoneNumber: value } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Phone number already exist.');
        }
      });
    }),
  body('email')
    .isEmail().withMessage('Please provide valid email address')
    .exists()
    .withMessage('Please provide valid email address')
    .notEmpty()
    .withMessage('Please provide valid email address'),
  body('password')
    .exists().withMessage('Please provide valid password')
    .notEmpty()
    .withMessage('Please provide valid password')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }
];

export const registerAgentRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('companyName').exists().withMessage('Please provide company name').notEmpty()
    .withMessage('Please provide company name'),
  body('companyPosition').exists().withMessage('Please provide company position').notEmpty()
    .withMessage('Please provide company position'),
  body('cityName').exists().withMessage('Please provide city name').notEmpty()
    .withMessage('Please provide city name'),
  body('countryName').exists().withMessage('Please provide country name').notEmpty()
    .withMessage('Please provide country name'),
  body('jobTitle').exists().withMessage('Please provide job title').notEmpty()
    .withMessage('Please provide job title'),
  body('licenseNo').exists().withMessage('Please provide company registration # or deed title').notEmpty()
    .withMessage('Please provide company registration # or deed title'),
  body('ornNumber').custom((value, { req }) => {
    const isDubaiUAE = req.body.cityName === 'Dubai' && req.body.countryName === 'United Arab Emirates';

    const isDeveloper = req.body.jobTitle.toLowerCase() === 'developer';

    if (isDubaiUAE && isDeveloper) {
      if (!value) {
        throw new Error('ORN number is required for developers in Dubai, United Arab Emirates');
      }
    }

    return true;
  }),
  body('phoneNumber')
    .exists().withMessage('Please provide phone number')
    .notEmpty()
    .withMessage('Please provide phone number')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line consistent-return
      return await db.models.user.findOne({ where: { phoneNumber: value } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Phone number already exist.');
        }
      });
    }),
  body('email')
    .isEmail().withMessage('Please provide valid email address')
    .exists()
    .withMessage('Please provide valid email address')
    .notEmpty()
    .withMessage('Please provide valid email address')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line consistent-return
      return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Email address already exist.');
        }
      });
    }),
  body('password')
    .exists().withMessage('Please provide valid password')
    .notEmpty()
    .withMessage('Please provide valid password')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

export const registerCustomerRules = [
  body('firstName').exists().withMessage('Please provide first name').notEmpty()
    .withMessage('Please provide first name'),
  body('lastName').exists().withMessage('Please provide last name').notEmpty()
    .withMessage('Please provide last name'),
  body('phoneNumber')
    .exists().withMessage('Please provide phone number')
    .notEmpty()
    .withMessage('Please provide phone number')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line consistent-return
      return await db.models.user.findOne({ where: { phoneNumber: value } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Phone number already exist.');
        }
      });
    }),
  body('email')
    .isEmail().withMessage('Please provide valid email address')
    .exists()
    .withMessage('Please provide valid email address')
    .notEmpty()
    .withMessage('Please provide valid email address')
    // eslint-disable-next-line arrow-body-style
    .custom(async (value) => {
      // eslint-disable-next-line consistent-return
      return await db.models.user.findOne({ where: { email: value.toLowerCase() } }).then((userData) => {
        if (userData) {
          // eslint-disable-next-line prefer-promise-reject-errors
          return Promise.reject('Email address already exist.');
        }
      });
    }),
  body('password')
    .exists().withMessage('Please provide valid password')
    .notEmpty()
    .withMessage('Please provide valid password')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

export const forgotPasswordRules = [
  check('email').exists().withMessage('Please provide email address').notEmpty()
    .withMessage('Please provide email address')
    .isEmail()
    .withMessage('Please provide valid email address'),
];

export const resetPasswordRules = [
  body('token').exists().withMessage('Please provide token').notEmpty()
    .withMessage('Please provide token'),
  body('password')
    .exists().withMessage('Please provide valid password')
    .notEmpty()
    .withMessage('Please provide valid password')
    .isLength({ min: 8 })
    .withMessage('Password must contain at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain at least one special character'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password and Confirm password should match');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];

export const sendOtpRules = [
  body('userId').notEmpty().withMessage('Please provide user id').exists()
    .withMessage('Please provide user id'),
];
