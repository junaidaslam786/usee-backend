import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import { opentokHelper, utilsHelper, mailHelper } from '@/helpers';
import * as userService from '../../user/user.service';
import { 
  EMAIL_TEMPLATE_PATH,
  EMAIL_SUBJECT, 
  USER_TYPE, 
  USER_ALERT_MODE, 
  USER_ALERT_TYPE,
  APPOINTMENT_TYPES,
  APPOINTMENT_STATUS,
  DASHBOARD_FILTER
} from '@/config/constants';
const path = require("path")
const ejs = require("ejs");
import timezoneJson from "../../../../timezones.json";

export const listAppointments = async (customerInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    const appointmentType = (reqBody && reqBody.type) ? reqBody.type : APPOINTMENT_TYPES.UPCOMING;

    const whereClause = { customerId: customerInfo.id };
    whereClause.status = {
      [OP.in]: [APPOINTMENT_STATUS.INPROGRESS, APPOINTMENT_STATUS.PENDING]
    };
    
    if (appointmentType === APPOINTMENT_TYPES.COMPLETED) {
      whereClause.status = APPOINTMENT_STATUS.COMPLETED;
    }

    if (appointmentType === APPOINTMENT_TYPES.CANCELLED) {
      whereClause.status = APPOINTMENT_STATUS.CANCELLED;
    }

    if (reqBody?.filter) {
      switch(reqBody?.filter) {
        case DASHBOARD_FILTER.CUSTOM:
          if (reqBody?.startDate && reqBody?.endDate) {
            whereClause.appointmentDate = {
              [OP.between]: [reqBody.startDate, reqBody.endDate]
            };
          }
          break;
        case DASHBOARD_FILTER.TODAY:
          whereClause.appointmentDate = utilsHelper.getCustomDate("today");
          break;
        case DASHBOARD_FILTER.YESTERDAY:
          whereClause.appointmentDate = utilsHelper.getCustomDate("yesterday");
          break;
        case DASHBOARD_FILTER.CURRENT_MONTH:
          whereClause.appointmentDate = {
            [OP.between]: [utilsHelper.getCustomDate("thisMonthStart"), utilsHelper.getCustomDate("thisMonthEnd")]
          };
          break;
        case DASHBOARD_FILTER.PAST_MONTH:
          whereClause.appointmentDate = {
            [OP.between]: [utilsHelper.getCustomDate("lastMonthStart"), utilsHelper.getCustomDate("lastMonthEnd")]
          };
          break;
        case DASHBOARD_FILTER.PAST_3_MONTH:
          whereClause.appointmentDate = {
            [OP.between]: [utilsHelper.getCustomDate("startOfPeriod"), utilsHelper.getCustomDate("endOfPeriod")]
          };
          break;
        default:
          break;
      }
    }

    const { count, rows } = await dbInstance.appointment.findAndCountAll({
      where: whereClause,
      include: [
        { 
          model: dbInstance.product, 
          attributes: ["id"],
          through: { attributes: [] }
        },
        { 
          model: dbInstance.user, 
          as: 'agentUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
          include: [
            {
              model: dbInstance.agent,
              attributes: ["id", "agentType"],
            },
          ]
        },
        { 
          model: dbInstance.user, 
          as: 'allotedAgentUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
        },
        { 
          model: dbInstance.agentTimeSlot, 
        },
      ],
      order: [["appointmentDate", "DESC"]],
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
    console.log('listAppointmentsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}

export const getAppointment = async (appointmentId, req) => {
  try {
    const { user, dbInstance } = req;
    const appoinment = await getAppointmentDetailById(user, appointmentId, dbInstance);
    if (!appoinment) {
        return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
    }

    return appoinment;
  } catch(err) {
    console.log('getAppointmentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}

export const createAppointment = async (req, dbInstance) => {
  try {
    const { 
      property, 
      appointmentDate, 
      timeSlotId,
      allotedAgent,
      timezone
    } = req.body;

    const sessionId = await opentokHelper.getSessionId();
    if (!sessionId) {
      return { error: true, message: 'Unable to make appointment due to voice call issue.'}
    }

    const propertyDetail = await dbInstance.product.findOne({ 
      where: { id: property },
      include: [
        {
          model: dbInstance.user, 
          attributes: ["id", "firstName", "lastName", "email", "timezone"],
        },
      ]
    });

    if (!propertyDetail) {
      return { error: true, message: 'Invalid property id or property do not exist.' };
    }

    // check if slot selected by customer is valid
    const timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: timeSlotId } });
    if (!timeSlot) {
      return { error: true, message: 'Invalid timeslot selected.' };
    }

    let allotedAgentUser = null;
    if (allotedAgent) {
      allotedAgentUser = await dbInstance.agent.findOne({
        where: { userId: allotedAgent },
        include: [{
          model: dbInstance.user, 
          attributes: ["firstName", "lastName", "email", "profileImage", "phoneNumber", "timezone"]
        }],
      });

      if (!allotedAgentUser) {
        return { error: true, message: 'Invalid user id or user do not exist.' };
      }
    }

    let customerDetails = req.user;
    let isNewCustomer = false;
    const tempPassword = utilsHelper.generateRandomString(10);
    if (!customerDetails) {
      let selectedTimezone = process.env.APP_DEFAULT_TIMEZONE;
      if (timezone) {
        const findTimezone = timezoneJson.find((tz) => tz.value === timezone);
        if (findTimezone) {
          selectedTimezone = findTimezone.value;
        }
      }

      customerDetails = await userService.createUserWithPassword({
        firstName: req.body.customerFirstName,
        lastName: req.body.customerLastName,
        email: req.body.customerEmail.toLowerCase(),
        password: tempPassword,
        status: true,
        userType: USER_TYPE.CUSTOMER,
        timezone: selectedTimezone,
      });

      isNewCustomer = true;
    }

    if (!customerDetails) {
      return { error: true, message: 'Session expired, please login to create appointment.'}
    }

    // check availability algorithm
    const foundTimeSlots = await checkAvailability({
      dbInstance,
      user: customerDetails,
      body: {
        date: appointmentDate,
        time: timeSlotId,
        userId: allotedAgentUser?.userId ? allotedAgentUser.userId : propertyDetail.userId
      }
    });

    if (foundTimeSlots?.error && foundTimeSlots?.message) {
      return foundTimeSlots;
    }

    const result = await db.transaction(async (transaction) => {
      // Create appointment
      const appointment = await dbInstance.appointment.create({
        appointmentDate,
        timeSlotId,
        agentId: propertyDetail.userId,
        customerId: customerDetails.id,
        allotedAgent: allotedAgentUser?.userId ? allotedAgentUser.userId : propertyDetail.userId,
        appointmentTimeGmt: utilsHelper.convertTimeToGmt(timeSlot.fromTime, customerDetails.timezone),
        sessionId,
      }, { transaction });

      // create agent alert
      await dbInstance.userAlert.create({
        customerId: customerDetails.id,
        productId: property,
        agentId: allotedAgentUser?.userId ? allotedAgentUser.userId : propertyDetail.userId,
        keyId: appointment.id,
        alertMode: USER_ALERT_MODE.APPOINTMENT,
        alertType: USER_ALERT_TYPE.APPOINTMENT,
        removed: false,
        viewed: false,
        emailed: false,
        createdBy: customerDetails.id
      }, { transaction });

      // Add products to appointment
      if (appointment && propertyDetail) {
        await dbInstance.appointmentProduct.create({
          appointmentId: appointment.id,
          productId: propertyDetail.id,
          interest: false,
        }, { transaction });

        if (allotedAgentUser?.userId) {
          // Fetch the existing allocation for the alloted agent
          const existingAllocations = await dbInstance.productAllocation.findOne({
            where: {
              userId: allotedAgentUser.userId,
              productId: propertyDetail.id,
            },
          });

          if (!existingAllocations) {
            await dbInstance.productAllocation.create({
              userId: allotedAgentUser.userId,
              productId: propertyDetail.id,
            }, { transaction });
          }
        }
      }

      if (isNewCustomer) {
        const emailNewData = [];
        emailNewData.name = customerDetails.fullName;
        emailNewData.tempPassword = tempPassword;
        emailNewData.login = utilsHelper.generateUrl('customer-login', USER_TYPE.CUSTOMER);
        const htmlNewData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_TEMP_PASSWORD), emailNewData);
        const newPayload = {
          to: customerDetails.email,
          subject: EMAIL_SUBJECT.AGENT_ADDED_CUSTOMER,
          html: htmlNewData,
        }
        mailHelper.sendMail(newPayload);
      }

      // send agent email
      const emailData = [];
      emailData.date = appointmentDate;
      emailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, (allotedAgentUser?.user?.email ? allotedAgentUser.user.timezone : propertyDetail.user.timezone), "HH:mm");
      emailData.products = [propertyDetail];
      emailData.customer = customerDetails.fullName;
      emailData.customerImage = customerDetails.profileImage;
      emailData.customerPhoneNumber = customerDetails.phoneNumber;
      emailData.customerEmail = customerDetails.email;
      emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
      emailData.appUrl = process.env.APP_URL;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.AGENT_JOIN_CUSTOMER_APPOINTMENT), emailData);
      const payload = {
        to: allotedAgentUser?.user?.email ? allotedAgentUser.user.email : propertyDetail.user.email,
        subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
        html: htmlData,
      }
      mailHelper.sendMail(payload);

      // send customer email
      const customerEmailData = [];
      customerEmailData.date = appointmentDate;
      customerEmailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, customerDetails.timezone, "HH:mm");
      customerEmailData.products = [propertyDetail];
      customerEmailData.allotedAgent = allotedAgentUser?.user?.lastName ? `${allotedAgentUser.user.firstName} ${allotedAgentUser.user.lastName}` : req.user.fullName;
      customerEmailData.companyName = req.user?.agent?.companyName ? req.user.agent.companyName : "";
      customerEmailData.agentImage = allotedAgentUser?.user?.profileImage ? allotedAgentUser.user.profileImage : req.user.profileImage;
      customerEmailData.agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber : req.user.phoneNumber;
      customerEmailData.agentEmail = allotedAgentUser?.user?.email ? allotedAgentUser.user.email : req.user.email
      customerEmailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/customer`;
      customerEmailData.appUrl = process.env.APP_URL;
      const customerHtmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.CUSTOMER_JOIN_CUSTOMER_APPOINTMENT), customerEmailData);
      const customerPayload = {
        to: customerDetails.email,
        subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
        html: customerHtmlData,
      }
      mailHelper.sendMail(customerPayload);

      return appointment;
    });

    return (result.id) ? await getAppointmentDetailById(customerDetails, result.id, dbInstance) : result;
  } catch(err) {
    console.log('createAppointmentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}

export const getSessionToken = async (appointmentId, dbInstance) => {
    try {
        const appointment = await dbInstance.appointment.findOne({
          where: { id: appointmentId },
          attributes: ['id', 'sessionId']
        });
  
        if (!appointment) {
          return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
        } 
        
        if (appointment && !appointment.sessionId) {
          return { error: true, message: 'Session id not available for this meeting'}
        }
  
        const token = await opentokHelper.getSessionEntryToken({firstName:'Zakria'}, '', appointment.sessionId);
  
        return { token };
    } catch(err) {
        console.log('getSessionTokenServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

const getAppointmentDetailById = async (user, appointmentId, dbInstance) => {
    const appointment = await dbInstance.appointment.findOne({
        where: { id: appointmentId, customerId: user.id },
        include: [
          {
            model: dbInstance.product,
            attributes: ["id", "title", "description", "price", "featuredImage"],
            through: { attributes: [] }
          },
          { 
            model: dbInstance.user, 
            as: 'customerUser',
            attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
          },
          { 
            model: dbInstance.user, 
            as: 'agentUser',
            attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
            include: [
              {
                model: dbInstance.agent,
                attributes: ["id", "agentType"],
              },
            ]
          },
          { 
            model: dbInstance.user, 
            as: 'allotedAgentUser',
            attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
          },
          { 
            model: dbInstance.agentTimeSlot, 
          },
        ],
    });
  
    if (!appointment) {
      return false;
    }
  
    return appointment;
}

export const deleteAppointment = async (appointmentId, req) => {
  try {
      const { dbInstance } = req;

      const whereClause = { id: appointmentId, customerId: req.user.id };
      const appointment = await dbInstance.appointment.findOne({ where: whereClause });
      if (!appointment) {
        return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
      }

      await dbInstance.appointment.destroy({ where: whereClause });

      return true;
  } catch(err) {
      console.log('deleteAppointmentServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
  }
}

export const checkAvailability = async (req) => {
  try {
    const { user: userRequestingAvailabilityCheck, dbInstance } = req;
    const { date, time, userId } = req.body;

    // check if slot selected by user(agent or customer) is valid
    let timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: time } });
    if (!timeSlot) {
      return { error: true, message: 'Invalid timeslot selected.' };
    }

    // check if customer is available
    const customerAvailability = await utilsHelper.availabilityAlgorithm(userRequestingAvailabilityCheck, userRequestingAvailabilityCheck.id, date, timeSlot, USER_TYPE.CUSTOMER, dbInstance);
    if (customerAvailability?.error && customerAvailability?.message) {
      return customerAvailability;
    }

    // if customer is available, check if agent is available or not
    const agentAvailability = await utilsHelper.availabilityAlgorithm(userRequestingAvailabilityCheck, userId, date, timeSlot, USER_TYPE.AGENT, dbInstance);
    if (agentAvailability?.error && agentAvailability?.message) {
      return agentAvailability;
    }

    // if both are available, then appointment can be created
    return true;
  } catch(err) {
    console.log('checkAvailabilityServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}
