import db from '@/database';
import { Sequelize, where } from 'sequelize';
const OP = Sequelize.Op;
import { opentokHelper, utilsHelper, mailHelper } from '@/helpers';
import * as userService from '../../user/user.service';
import { getCarbonFootprint } from '../analytics/analytics.service';
import {
  EMAIL_TEMPLATE_PATH,
  EMAIL_SUBJECT,
  USER_TYPE,
  APPOINTMENT_STATUS,
  APPOINTMENT_LOG_TYPE,
  APPOINTMENT_TYPES,
  DASHBOARD_FILTER
} from '@/config/constants';

const cron = require('node-cron');
const moment = require('moment-timezone');
const path = require("path")
const ejs = require("ejs");
const { Auth } = require('@vonage/auth');
const { Vonage } = require('@vonage/server-sdk');

const credentials = new Auth({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});
const options = {};
const vonage = new Vonage(credentials, options);

async function sendSMS(to, from, text) {
  await vonage.sms.send({ to, from, text })
    .then(resp => { console.log('Message sent successfully'); console.log(resp); })
    .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

function calculateCronExpression(date, startTime) {
  const targetMinute = moment(startTime, 'HH:mm').format('mm'); // Extract minute from start time
  const targetHour = moment(startTime, 'HH:mm').format('HH'); // Extract hour from start time
  const targetDay = moment(date).format('D'); // Day of the month
  const targetDayOfWeek = moment(date).format('d'); // Day of the week (0-indexed)
  const targetMonth = moment(date).format('M'); // Month (1-indexed)

  // Runs once at the specified time on the appointment date
  return `${targetMinute} ${targetHour} ${targetDay} ${targetMonth} ${targetDayOfWeek}`;
}

export const listAppointments = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    const appointmentType = (reqBody && reqBody.type) ? reqBody.type : APPOINTMENT_TYPES.UPCOMING;

    const selectedUser = (reqBody && reqBody?.selectedUser) ? reqBody?.selectedUser : agentInfo.id;
    const whereClause = {
      [OP.or]: [
        { agentId: selectedUser },
        { allotedAgent: selectedUser }
      ]
    };

    whereClause.status = {
      [OP.in]: [APPOINTMENT_STATUS.INPROGRESS, APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.EXPIRED]
    };

    if (appointmentType === APPOINTMENT_TYPES.UPCOMING) {
      whereClause.status = APPOINTMENT_STATUS.PENDING;
    }

    if (appointmentType === APPOINTMENT_TYPES.COMPLETED) {
      whereClause.status = APPOINTMENT_STATUS.COMPLETED;
    }

    if (appointmentType === APPOINTMENT_TYPES.CANCELLED) {
      whereClause.status = APPOINTMENT_STATUS.CANCELLED;
    }

    if (appointmentType === APPOINTMENT_TYPES.EXPIRED) {
      whereClause.status = APPOINTMENT_STATUS.EXPIRED;
    }

    if (reqBody?.filter) {
      switch (reqBody?.filter) {
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
          as: 'customerUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
        },
        {
          model: dbInstance.user,
          as: 'allotedAgentUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
        },
        {
          model: dbInstance.agentTimeSlot,
        },
        {
          model: dbInstance.appointmentNote,
          attributes: ["id", "notes"],
          required: false,
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
  } catch (err) {
    console.log('listAppointmentsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const getAppointment = async (appointmentId, req) => {
  try {
    const { user, dbInstance } = req;
    const appoinment = await getAppointmentDetailById(user.agent, appointmentId, dbInstance);
    if (!appoinment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' }
    }

    return appoinment;
  } catch (err) {
    console.log('getAppointmentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const createAppointment = async (req, dbInstance) => {
  try {
    const {
      properties,
      appointmentDate,
      timeSlotId,
      allotedAgent
    } = req.body;

    const sessionId = await opentokHelper.getSessionId(req.user.id);
    if (!sessionId) {
      return { error: true, message: 'Unable to make appointment due to voice call issue.' };
    }

    const timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: timeSlotId } });
    if (!timeSlot) {
      return { error: true, message: 'Invalid timeslot selected.' };
    }

    const customerDetails = await getOrCreateCustomer(req.user.id, req.body);
    if (customerDetails?.error && customerDetails?.message) {
      return customerDetails;
    }

    let allotedAgentUser = false;
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

    // check availability algorithm
    const foundTimeSlots = await checkAvailability({
      dbInstance,
      user: req.user,
      body: {
        date: appointmentDate,
        time: timeSlotId,
        userId: allotedAgentUser?.userId ? allotedAgentUser.userId : req.user.id,
        customerId: customerDetails.id
      }
    });

    if (foundTimeSlots?.error && foundTimeSlots?.message) {
      return foundTimeSlots;
    }

    // start creating appointment transaction
    const result = await db.transaction(async (transaction) => {
      // Create appointment
      const appointment = await dbInstance.appointment.create({
        appointmentDate,
        timeSlotId,
        agentId: req.user.id,
        customerId: customerDetails.id,
        allotedAgent: allotedAgentUser?.userId ? allotedAgentUser.userId : req.user.id,
        appointmentTimeGmt: utilsHelper.convertTimeToGmt(timeSlot.fromTime, req.user.timezone),
        sessionId,
      }, { transaction });

      // Add products to appointment
      let findProducts = []
      let allocatedUsers = [];
      if (appointment && properties) {
        findProducts = await dbInstance.product.findAll({ where: { id: properties } });

        if (allotedAgentUser?.userId) {
          // Fetch the existing allocations for the alloted agent
          const existingAllocations = await dbInstance.productAllocation.findAll({
            where: {
              userId: allotedAgentUser.userId,
              productId: properties,
            },
          });

          // Create a Set of existing productIds allocated to the alloted agent
          const existingProductIds = new Set(existingAllocations.map((allocation) => allocation.productId));

          // Filter the products that are not already allocated to the alloted agent
          const unAllocatedProducts = findProducts.filter((product) => !existingProductIds.has(product.id));

          // Create the new allocations
          allocatedUsers = unAllocatedProducts.map((product) => ({
            productId: product.id,
            userId: allotedAgentUser.userId,
          }));
        }

        const productRecords = [];
        findProducts.forEach((product) => {
          productRecords.push({
            appointmentId: appointment.id,
            productId: product.id,
            interest: false,
          });
        });

        if (productRecords.length > 0) {
          await dbInstance.appointmentProduct.bulkCreate(productRecords, { transaction });
        }

        if (allocatedUsers.length > 0) {
          await dbInstance.productAllocation.bulkCreate(allocatedUsers, { transaction });
        }
      }

      // send customer SMS
      // const from = 'USEE360';
      // const customerPhoneNumber = customerDetails.phoneNumber.replace(/^\+/, '');
      // const customerText = 'Hello, your appointment has been scheduled.';
      // await sendSMS(customerPhoneNumber, from, customerText);

      // send customer email
      const emailData = [];
      emailData.date = appointmentDate;
      emailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, customerDetails.timezone, "HH:mm");
      emailData.products = findProducts;
      emailData.allotedAgent = allotedAgentUser?.user?.firstName ? `${allotedAgentUser.user.firstName} ${allotedAgentUser.user.lastName}` : req.user.fullName;
      emailData.companyName = req.user?.agent?.companyName ? req.user.agent.companyName : "";
      emailData.agentImage = allotedAgentUser?.user?.profileImage ? allotedAgentUser.user.profileImage : req.user.profileImage;
      emailData.agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber : req.user.phoneNumber;
      emailData.agentEmail = allotedAgentUser?.user?.email ? allotedAgentUser.user.email : req.user.email
      emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/customer`;
      emailData.appUrl = process.env.APP_URL;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.CUSTOMER_JOIN_AGENT_APPOINTMENT), emailData);
      const payload = {
        to: customerDetails.email,
        subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
        html: htmlData,
      }
      mailHelper.sendMail(payload);

      // send agent SMS
      // const agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber.replace(/^\+/, '') : req.user.phoneNumber.replace(/^\+/, '');
      // const agentText = `Hello , your appointment has been scheduled.`;
      // await sendSMS(agentPhoneNumber, from, agentText);

      // send agent email
      const agentEmailData = [];
      agentEmailData.date = appointmentDate;
      agentEmailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, (allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone), "HH:mm");
      agentEmailData.products = findProducts;
      agentEmailData.primaryAgent = req.user.fullName;
      agentEmailData.customer = customerDetails.fullName;
      agentEmailData.customerImage = customerDetails.profileImage;
      agentEmailData.customerPhoneNumber = customerDetails.phoneNumber;
      agentEmailData.customerEmail = customerDetails.email;
      agentEmailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
      agentEmailData.appUrl = process.env.APP_URL;

      const agentEmailHtmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, (allotedAgentUser ? EMAIL_TEMPLATE_PATH.ALLOTED_AGENT_JOIN_AGENT_APPOINTMENT : EMAIL_TEMPLATE_PATH.AGENT_JOIN_AGENT_APPOINTMENT)), agentEmailData);
      const agentEmailPayload = {
        to: allotedAgentUser ? allotedAgentUser.user.email : req.user.email,
        subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
        html: agentEmailHtmlData,
      }
      mailHelper.sendMail(agentEmailPayload);

      // Schedule cron job to send reminder SMS and email 30 minutes before the call
      const startTime = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, customerDetails.timezone, "HH:mm");
      const startTimeMoment = moment(startTime, 'HH:mm').tz(customerDetails.timezone);
      const thirtyMinutesBeforeStartTime = startTimeMoment.clone().subtract(30, 'minutes');
      console.log('appointmentDate: ', appointmentDate);
      console.log('startTime: ', startTime);
      console.log('startTimeMoment: ', startTimeMoment);
      console.log('thirtyMinutesBeforeStartTime: ', thirtyMinutesBeforeStartTime);

      const cronExpression = calculateCronExpression(appointmentDate, thirtyMinutesBeforeStartTime);
      console.log('CE: ', cronExpression);

      const scheduledJob = cron.schedule(cronExpression, async () => {
        // ** SEND CUSTOMER SMS ** //
        // const smsText = `Your appointment is scheduled on ${appointmentDate} at ${startTime} ${customerDetails.timezone}. Please click on the link to join the meeting: ${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/customer`;
        // console.log(smsText);
        // await sendSMS(customerDetails.phoneNumber, 'USEE360', smsText);

        // ** SEND CUSTOMER EMAIL ** //
        const emailData = [];
        emailData.date = appointmentDate;
        emailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, customerDetails.timezone, "HH:mm");
        emailData.timezone = customerDetails.timezone;
        emailData.products = [];
        emailData.allotedAgent = allotedAgentUser?.user?.firstName ? `${allotedAgentUser.user.firstName} ${allotedAgentUser.user.lastName}` : `${req.user.firstName} ${req.user.lastName}`;
        emailData.companyName = req.user.companyName ? req.user.companyName : "";
        emailData.agentImage = allotedAgentUser?.user?.profileImage ? allotedAgentUser.user.profileImage : req.user.profileImage;
        emailData.agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber : req.user.phoneNumber;
        emailData.agentEmail = allotedAgentUser?.user?.email ? allotedAgentUser.user.email : req.user.email
        emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/customer`;
        emailData.contactEmail = process.env.CONTACT_EMAIL;
        emailData.appUrl = process.env.APP_URL;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.CUSTOMER_UPCOMING_APPOINTMENT), emailData);
        const payload = {
          to: customerDetails.email,
          subject: EMAIL_SUBJECT.UPCOMING_APPOINTMENT,
          html: htmlData,
        }
        mailHelper.sendMail(payload);
      }, {
        scheduled: true, // Set the scheduled option for one-time execution
        timezone: customerDetails.timezone,
      });
      console.log('Scheduled job(Customer): ', scheduledJob);

      appointment.scheduledJobCustomer = scheduledJob.options.name;
      await appointment.save();

      const startTime2 = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, (allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone), "HH:mm");
      const startTimeMoment2 = moment(startTime2, 'HH:mm').tz('UTC'); // Parse in UTC
      const thirtyMinutesBeforeStartTime2 = startTimeMoment2.clone().subtract(30, 'minutes');
      console.log('appointmentDate: ', appointmentDate);
      console.log('startTime: ', startTime2);
      console.log('startTimeMoment: ', startTimeMoment2);
      console.log('thirtyMinutesBeforeStartTime: ', thirtyMinutesBeforeStartTime2);

      const cronExpression2 = calculateCronExpression(appointmentDate, thirtyMinutesBeforeStartTime, (allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone));
      console.log('CE: ', cronExpression2);

      const scheduledJob2 = cron.schedule(cronExpression2, async () => {
        // ** SEND AGENT SMS ** //
        // if (allotedAgentUser) {
        //   const agentSmsText = `You have an appointment scheduled on ${appointmentDate} at ${startTime} ${allotedAgentUser.user.timezone}. Please click on the link to join the meeting: ${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
        //   console.log(agentSmsText);
        //   await sendSMS(allotedAgentUser.user.phoneNumber, 'USEE360', agentSmsText);
        // } else {
        //   const agentSmsText = `You have an appointment scheduled on ${appointmentDate} at ${startTime} ${req.user.timezone}. Please click on the link to join the meeting: ${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
        //   console.log(agentSmsText);
        //   await sendSMS(req.user.phoneNumber, 'USEE360', agentSmsText);
        // }

        // ** SEND AGENT EMAIL ** //
        const agentEmailData = [];
        agentEmailData.date = appointmentDate;
        agentEmailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, (allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone), "HH:mm");
        agentEmailData.timezone = allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone;
        agentEmailData.products = [];
        agentEmailData.allotedAgent = allotedAgentUser?.user?.firstName ? `${allotedAgentUser.user.firstName} ${allotedAgentUser.user.lastName}` : `${req.user.firstName} ${req.user.lastName}`;
        agentEmailData.companyName = req.user.companyName ? req.user.companyName : "";
        agentEmailData.agentImage = allotedAgentUser?.user?.profileImage ? allotedAgentUser.user.profileImage : req.user.profileImage;
        agentEmailData.agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber : req.user.phoneNumber;
        agentEmailData.agentEmail = allotedAgentUser?.user?.email ? allotedAgentUser.user.email : req.user.email
        agentEmailData.customer = customerDetails.fullName;
        agentEmailData.customerImage = customerDetails.profileImage;
        agentEmailData.customerPhoneNumber = customerDetails.phoneNumber;
        agentEmailData.customerEmail = customerDetails.email;
        agentEmailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
        agentEmailData.contactEmail = process.env.CONTACT_EMAIL;
        agentEmailData.appUrl = process.env.APP_URL;

        const agentEmailHtmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, (allotedAgentUser ? EMAIL_TEMPLATE_PATH.AGENT_UPCOMING_APPOINTMENT : EMAIL_TEMPLATE_PATH.AGENT_UPCOMING_APPOINTMENT)), agentEmailData);
        const agentEmailPayload = {
          to: allotedAgentUser ? allotedAgentUser.user.email : req.user.email,
          subject: EMAIL_SUBJECT.UPCOMING_APPOINTMENT,
          html: agentEmailHtmlData,
        }
        mailHelper.sendMail(agentEmailPayload);
      }, {
        scheduled: true, // Set the scheduled option for one-time execution
        timezone: allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone,
      });
      console.log('Scheduled job(Agent): ', scheduledJob2);

      appointment.scheduledJobAgent = scheduledJob2.options.name;
      await appointment.save();

      // Schedule cron job to update appointment status to 'expired' after 30 minutes when no one joins
      const startTime3 = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, (allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone), "HH:mm");
      const startTimeMoment3 = moment(startTime3, 'HH:mm').tz((allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone));
      const thirtyMinutesAfterStartTime = startTimeMoment3.clone().add(30, 'minutes');
      console.log('startTime: ', startTime3);
      console.log('startTimeMoment: ', startTimeMoment3);
      console.log('thirtyMinutesAfterStartTime: ', thirtyMinutesAfterStartTime);

      const cronExpression3 = calculateCronExpression(appointmentDate, thirtyMinutesAfterStartTime);
      console.log('CE: ', cronExpression3);

      const scheduledJob3 = cron.schedule(cronExpression3, async () => {
        const appoinmentLatest = await dbInstance.appointment.findOne({
          where: {
            id: appointment.id,
            status: 'pending'
          }
        });
        if (appoinmentLatest) {
          await dbInstance.appointment.update({
            status: 'expired'
          }, {
            where: {
              id: appointment.id,
              status: 'pending'
            }
          });
          console.log('Appointment status updated to expired');
        } else {
          console.log('Appointment status was not updated');
        }
      }, {
        scheduled: true, // Set the scheduled option for one-time execution
        timezone: allotedAgentUser ? allotedAgentUser.user.timezone : req.user.timezone,
      });
      console.log('Scheduled job(Expired): ', scheduledJob3);

      return appointment;
    });

    return (result.id) ? await getAppointmentDetailById((allotedAgentUser ? allotedAgentUser : req.user.agent), result.id, dbInstance) : result;
  } catch (err) {
    console.log('createAppointmentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const deleteAppointment = async (appointmentId, req) => {
  try {
    const { dbInstance } = req;

    const whereClause = { id: appointmentId, allotedAgent: req.user.id };
    const appointment = await dbInstance.appointment.findOne({ where: whereClause });
    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' }
    }

    await dbInstance.appointment.destroy({ where: whereClause });

    return true;
  } catch (err) {
    console.log('deleteAppointmentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

const getAppointmentDetailById = async (agent, appointmentId, dbInstance) => {
  const appointment = await dbInstance.appointment.findOne({
    where: {
      id: appointmentId
    },
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
      {
        model: dbInstance.appointmentNote,
        attributes: ["id", "notes"],
        required: false,
      },
    ],
  });

  if (!appointment) {
    return false;
  }

  return appointment;
}

export const getSessionToken = async (appointmentId, dbInstance) => {
  try {
    const appointment = await dbInstance.appointment.findOne({
      where: { id: appointmentId },
      attributes: ['id', 'sessionId']
    });

    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' }
    }

    if (appointment && !appointment.sessionId) {
      return { error: true, message: 'Session id not available for this meeting' }
    }

    const token = await opentokHelper.getSessionEntryToken({ firstName: 'Zakria' }, '', appointment.sessionId);

    return { token };
  } catch (err) {
    console.log('getSessionTokenServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const getSessionDetails = async (appointmentId, dbInstance) => {
  try {
    const appointment = await dbInstance.appointment.findOne({
      where: { id: appointmentId },
      attributes: ['id', 'sessionId']
    });

    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' }
    }

    if (appointment && !appointment.sessionId) {
      return { error: true, message: 'Session id not available for this meeting' }
    }

    console.log('appointment.sessionId', appointment.sessionId)
    const sessionDetails = await opentokHelper.getSessionDetails(appointment.sessionId);

    return sessionDetails;
  } catch (err) {
    console.log('getSessionDetailsServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const downloadSessionRecording = async (archiveId, dbInstance) => {
  try {
    // const appointment = await dbInstance.appointment.findOne({
    //   where: { id: appointmentId },
    //   attributes: ['id', 'sessionId']
    // });

    // if (!appointment) {
    //   return { error: true, message: 'Invalid appointment id or Appointment do not exist.' }
    // }

    // if (appointment && !appointment.sessionId) {
    //   return { error: true, message: 'Session id not available for this meeting' }
    // }

    const archive = await opentokHelper.downloadArchive(archiveId);

    return archive;
  } catch (err) {
    console.log('downloadSessionRecordingServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

const getOrCreateCustomer = async (agentId, reqBody, transaction) => {
  let customerDetails;
  const customerId = reqBody.customerId;
  if (customerId) {
    customerDetails = await userService.getUserById(customerId);
    if (!customerDetails) {
      return { error: true, message: 'Invalid customer id or customer do not exist.' }
    }

    return customerDetails;
  }

  if (!customerId && reqBody.customerEmail) {
    customerDetails = await userService.getUserByEmail(reqBody.customerEmail);
    if (customerDetails && customerDetails.userType != USER_TYPE.CUSTOMER) {
      return { error: true, message: 'User is not registered as customer in our platform. Try another email.' }
    } else if (!customerDetails) {
      const tempPassword = utilsHelper.generateRandomString(10);
      customerDetails = await userService.createUserWithPassword({
        firstName: reqBody.customerFirstName,
        lastName: reqBody.customerLastName,
        email: reqBody.customerEmail.toLowerCase(),
        phoneNumber: reqBody.customerPhone,
        password: tempPassword,
        status: true,
        userType: USER_TYPE.CUSTOMER,
        createdBy: agentId,
      }, transaction);

      const emailData = [];
      emailData.name = customerDetails.fullName;
      emailData.tempPassword = tempPassword;
      emailData.login = utilsHelper.generateUrl('customer-login', USER_TYPE.CUSTOMER);
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.REGISTER_TEMP_PASSWORD), emailData);
      const payload = {
        to: customerDetails.email,
        subject: EMAIL_SUBJECT.AGENT_ADDED_CUSTOMER,
        html: htmlData,
      }
      mailHelper.sendMail(payload);

      return customerDetails;
    }

    return customerDetails
  }
}

export const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const { user: userInfo, dbInstance } = req;

    const appointment = await dbInstance.appointment.findOne({
      where: { id },
      include: [
        {
          model: dbInstance.product,
          attributes: ["id", "title", "description", "price", "featuredImage", "address", "city", "region", "latitude", "longitude"],
          through: { attributes: [] }
        },
        {
          model: dbInstance.user,
          as: 'customerUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone"],
        },
        {
          model: dbInstance.user,
          as: 'allotedAgentUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone", "latitude", "longitude"],
        },
        {
          model: dbInstance.user,
          as: 'agentUser',
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage", "timezone", "latitude", "longitude"],
        },
        {
          model: dbInstance.agentTimeSlot,
        },
      ],
    });

    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' };
    }

    if (appointment.status === status) {
      return { error: true, message: 'The status of the appointment already updated.' };
    }

    if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
      return { error: true, message: 'Invalid status.' };
    }

    appointment.status = status;
    if (status === APPOINTMENT_STATUS.INPROGRESS) {
      appointment.startMeetingTime = Date.now();
    }

    if (status === APPOINTMENT_STATUS.COMPLETED) {
      appointment.endMeetingTime = Date.now();
      
      const subscription = await db.models.subscription.findOne({
        where: { name: 'USEE360 Basic' },
      });
      const feature = await db.models.feature.findOne({
        where: { name: 'Carbon Footprint' },
      });

      const userSubscription = await userSubscription.findOne({
        where: {
          userId: appointment.agentUser.id,
          subscriptionId: subscription.id,
          featureId: feature.id,
        },
      });

      if (userSubscription) {
        let totalCo2SavedValue = 0;
        let propertyLocation = {};
        const agentUser = appointment.agentUser;


        if (agentUser.latitude && agentUser.longitude) {
          const agentUserLocation = {
            latitude: agentUser.latitude,
            longitude: agentUser.longitude
          }
          req.body.agentLocation = agentUserLocation;
          await Promise.all(appointment.products.map(async (product) => {
            if (product.latitude && product.longitude) {
              propertyLocation = {
                latitude: product.latitude,
                longitude: product.longitude
              }
              req.body.propertyLocation = propertyLocation;
              const appoinmentProduct = await dbInstance.appointmentProduct.findOne({
                where: {
                  appointmentId: appointment.id,
                  productId: product.id
                }
              });

              const co2Details = await getCarbonFootprint(req, res);
              // console.log('co2Details: ', co2Details);
              co2Details.commuteType = 'car';
              appoinmentProduct.co2Details = co2Details;
              await appoinmentProduct.save();

              totalCo2SavedValue += co2Details.co2SavedValue;
            }
          }));
          // console.log('totalCo2Saved: ', totalCo2SavedValue);
          const totalCo2SavedText = `${totalCo2SavedValue} metric tons CO₂E`;
          appointment.co2Details = {
            // products: productCo2,
            commuteType: 'car',
            totalCo2SavedText,
            totalCo2SavedValue,
          };
        }
      }
    }

    if (status === APPOINTMENT_STATUS.COMPLETED || status === APPOINTMENT_STATUS.CANCELLED) {
      const emailData = [];
      emailData.date = appointment.appointmentDate;
      emailData.products = appointment.products;
      emailData.appUrl = process.env.APP_URL;
      emailData.appointmentStatus = status;

      const emailSubject = status === APPOINTMENT_STATUS.COMPLETED ? EMAIL_SUBJECT.COMPLETED_APPOINTMENT : EMAIL_SUBJECT.CANCELLED_APPOINTMENT;
      let htmlData = "";
      let payload = {};
      if (userInfo.userType === USER_TYPE.AGENT) {
        emailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, appointment.customerUser.timezone, "HH:mm");
        emailData.companyName = userInfo?.agent?.companyName ? userInfo.agent.companyName : "";
        emailData.allotedAgent = appointment.allotedAgentUser.fullName;
        emailData.agentImage = appointment.allotedAgentUser.profileImage;
        emailData.agentPhoneNumber = appointment.allotedAgentUser.phoneNumber;
        emailData.agentEmail = appointment.allotedAgentUser.email;
        htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.AGENT_STATUS_UPDATE_APPOINTMENT), emailData);
        payload = {
          to: appointment.customerUser.email,
          subject: emailSubject,
          html: htmlData,
        }
      } else {
        emailData.time = utilsHelper.convertGmtToTime(appointment.appointmentTimeGmt, appointment.allotedAgentUser.timezone, "HH:mm");
        emailData.customer = userInfo.fullName;
        emailData.customerImage = userInfo.profileImage;
        emailData.customerPhoneNumber = userInfo.phoneNumber;
        emailData.customerEmail = userInfo.email;
        htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.CUSTOMER_STATUS_UPDATE_APPOINTMENT), emailData);
        payload = {
          to: appointment.allotedAgentUser.email,
          subject: emailSubject,
          html: htmlData,
        }
      }

      mailHelper.sendMail(payload);
    }

    await appointment.save();

    return true;
  } catch (err) {
    console.log('updateStatusServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const addLog = async (reqBody, req) => {
  try {
    const { id, logType, reason } = reqBody;
    const { user: userInfo, dbInstance } = req;

    const appointment = await dbInstance.appointment.findOne({
      where: { id },
      attributes: ['id']
    });

    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' };
    }

    if (!Object.values(APPOINTMENT_LOG_TYPE).includes(logType)) {
      return { error: true, message: 'Invalid log type.' };
    }

    // Create appointment log
    await dbInstance.appointmentLog.create({
      userId: reqBody?.userId ? reqBody?.userId : userInfo.id,
      appointmentId: id,
      userType: reqBody?.userType ? reqBody?.userType : userInfo.userType,
      logType,
      reason,
      addedAt: Date.now(),
    });

    return true;
  } catch (err) {
    console.log('addLogServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const addNote = async (reqBody, req) => {
  try {
    const { id, userId, userType, notes } = reqBody;
    const { dbInstance } = req;

    const appointment = await dbInstance.appointment.findOne({
      where: { id },
      attributes: ['id']
    });

    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' };
    }

    const appoinmentNote = {
      appointmentId: id,
      notes,
    }

    if (userId && userType === USER_TYPE.AGENT) {
      appoinmentNote.agentId = userId;
    }

    if (userId && userType === USER_TYPE.CUSTOMER) {
      appoinmentNote.customerId = userId;
    }

    // Create appointment note
    await dbInstance.appointmentNote.create(appoinmentNote);

    return true;
  } catch (err) {
    console.log('addNoteServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}

export const checkAvailability = async (req) => {
  try {
    const { user: userRequestingAvailabilityCheck, dbInstance } = req;
    const { date, time, userId, customerId } = req.body;

    // check if slot selected by user(agent or customer) is valid
    let timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: time } });
    if (!timeSlot) {
      return { error: true, message: 'Invalid timeslot selected.' };
    }

    // if agent user is available, then check if customer is available or not
    if (customerId) {
      const customerAvailability = await utilsHelper.availabilityAlgorithm(userRequestingAvailabilityCheck, customerId, date, timeSlot, USER_TYPE.CUSTOMER, dbInstance);
      if (customerAvailability?.error && customerAvailability?.message) {
        return customerAvailability;
      }
    }

    // if agent is assigning appointment to the user
    const agentAvailability = await utilsHelper.availabilityAlgorithm(userRequestingAvailabilityCheck, (userId ? userId : userRequestingAvailabilityCheck.id), date, timeSlot, USER_TYPE.AGENT, dbInstance);
    if (agentAvailability?.error && agentAvailability?.message) {
      return agentAvailability;
    }

    return true;
  } catch (err) {
    console.log('checkAvailabilityServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' }
  }
}
