import { DataTypes, Model } from 'sequelize';
import { opentokHelper, utilsHelper, mailHelper } from '@/helpers';
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
  await vonage.sms.send({to, from, text})
      .then(resp => { console.log('Message sent successfully'); console.log(resp); })
      .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

export default function (sequelize) {
  class Appointment extends Model {
    static associate(models) {
      Appointment.belongsToMany(models.product, { through: 'appointment_products', updatedAt: false, unique: false });
      Appointment.belongsTo(models.user, { foreignKey: 'agentId', as: 'agentUser' });
      Appointment.belongsTo(models.user, { foreignKey: 'customerId', as: 'customerUser' });
      Appointment.belongsTo(models.user, { foreignKey: 'allotedAgent', as: 'allotedAgentUser' });
      Appointment.belongsTo(models.agentTimeSlot, { foreignKey: 'timeSlotId' });
      Appointment.hasMany(models.appointmentLog, { foreignKey: 'appointmentId' });
      Appointment.hasMany(models.appointmentNote, { foreignKey: 'appointmentId' });
    }
  }

  Appointment.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    agentId: {
      field: 'agent_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    customerId: {
      field: 'customer_id',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    allotedAgent: {
      field: 'alloted_agent',
      type: DataTypes.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    },
    appointmentDate: {
      field: 'appointment_date',
      allowNull: false,
      type: DataTypes.DATEONLY,
    },
    timeSlotId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'agent_time_slots',
        key: 'id',
      },
    },
    sessionId: {
      type: DataTypes.STRING,
      field: 'session_id',
    },
    status: {
      type: DataTypes.STRING,
    },
    startMeetingTime: {
      type: DataTypes.STRING,
      field: 'start_meeting_time',
    },
    endMeetingTime: {
      type: DataTypes.STRING,
      field: 'end_meeting_time',
    },
    appointmentTimeGmt: {
      type: DataTypes.STRING,
      field: 'appointment_time_gmt',
    },
    scheduledJobAgent: {
      type: DataTypes.STRING,
      field: 'scheduled_job_agent',
    },
    scheduledJobCustomer: {
      type: DataTypes.STRING,
      field: 'scheduled_job_customer',
    },
    createdAt: {
      allowNull: false,
      field: 'created_at',
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      field: 'updated_at',
      type: DataTypes.DATE,
    },
    deletedAt: {
      allowNull: true,
      type: DataTypes.DATE,
      field: 'deleted_at',
      defaultValue: null,
    },
  }, {
    modelName: 'appointment',
    tableName: 'appointments',
    sequelize,
    paranoid: true,
  });

  function calculateCronExpression(date, startTime) {
    const targetMinute = moment(startTime, 'HH:mm').format('mm'); // Extract minute from start time
    const targetHour = moment(startTime, 'HH:mm').format('HH'); // Extract hour from start time
    const targetDay = moment(date).format('D'); // Day of the month
    const targetDayOfWeek = moment(date).format('d'); // Day of the week (0-indexed)
    const targetMonth = moment(date).format('M'); // Month (1-indexed)

    // Runs once at the specified time on the appointment date
    return `${targetMinute} ${targetHour} ${targetDay} ${targetMonth} ${targetDayOfWeek}`;
  }

  // eslint-disable-next-line no-unused-vars
  Appointment.addHook('beforeSave', async (instance) => {
    const customerDetails = await sequelize.models.user.findOne({
      where: {
        id: instance.customerId
      }
    });
    if (customerDetails?.error && customerDetails?.message) {
      console.log('Error fetching customer details:', customerDetails.message);
      throw new Error("Customer doesn't exist.");
    }

    const agentDetails = await sequelize.models.user.findOne({
      where: { id: instance.agentId },
      include: [{
        model: sequelize.models.agent,
        attributes: ["companyName",]
      }],
    });
    if (!agentDetails || !agentDetails.id) {
      throw new Error("Agent doesn't exist.");
    }

    let allotedAgentUser = false;
    if (instance.allotedAgent) {
      allotedAgentUser = await sequelize.models.agent.findOne({
        where: { userId: instance.allotedAgent },
        include: [{
          model: sequelize.models.user,
          attributes: ["firstName", "lastName", "email", "profileImage", "phoneNumber", "timezone"]
        }],
      });

      if (!allotedAgentUser) {
        console.log('Invalid user id or user does not exist.');
        throw new Error("AllotedAgent doesn't exist.");
      }
    }

    const { appointmentDate } = instance;
    const startTime = utilsHelper.convertGmtToTime(instance.appointmentTimeGmt, customerDetails.timezone, "HH:mm");
    const startTimeMoment = moment(startTime, 'HH:mm').tz('UTC'); // Parse in UTC
    const fifteenMinutesBeforeStartTime = startTimeMoment.subtract(15, 'minutes');
    console.log('appointmentDate: ', appointmentDate);
    console.log('startTime: ', startTime);
    console.log('startTimeMoment: ', startTimeMoment);
    console.log('fifteenMinutesBeforeStartTime: ', fifteenMinutesBeforeStartTime);

    const cronExpression = calculateCronExpression(appointmentDate, fifteenMinutesBeforeStartTime);
    console.log('CE: ', cronExpression);

    if (instance.isNewRecord) {
      console.log('New record');
    } else {
      console.log('Old record');

      // ** SEND CUSTOMER SMS ** //
      const smsText = `Your appointment is scheduled on ${appointmentDate} at ${startTime} ${customerDetails.timezone}. Please click on the link to join the meeting: ${utilsHelper.generateUrl('join-meeting')}/${instance.id}/customer`;
      await sendSMS(customerDetails.phoneNumber, 'USEE360', smsText);

      // ** SEND CUSTOMER EMAIL ** //
      const scheduledJob = cron.schedule(cronExpression, async () => {
        const emailData = [];
        emailData.date = appointmentDate;
        emailData.time = utilsHelper.convertGmtToTime(instance.appointmentTimeGmt, customerDetails.timezone, "HH:mm");
        emailData.timezone = customerDetails.timezone;
        emailData.products = [];
        emailData.allotedAgent = allotedAgentUser?.user?.firstName ? `${allotedAgentUser.user.firstName} ${allotedAgentUser.user.lastName}` : `${agentDetails.firstName} ${agentDetails.lastName}`;
        emailData.companyName = agentDetails.companyName ? agentDetails.companyName : "";
        emailData.agentImage = allotedAgentUser?.user?.profileImage ? allotedAgentUser.user.profileImage : agentDetails.profileImage;
        emailData.agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber : agentDetails.phoneNumber;
        emailData.agentEmail = allotedAgentUser?.user?.email ? allotedAgentUser.user.email : agentDetails.email
        emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${instance.id}/customer`;
        emailData.contactEmail = process.env.CONTACT_EMAIL;
        emailData.appUrl = process.env.APP_URL;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.CUSTOMER_UPCOMING_APPOINTMENT), emailData);
        const payload = {
          to: customerDetails.email,
          subject: EMAIL_SUBJECT.UPCOMING_APPOINTMENT,
          html: htmlData,
        }
        mailHelper.sendMail(payload);
        // Assuming instance.scheduledJob is an array
        // if (!Array.isArray(instance.scheduledJobCustomer)) {
        //   instance.scheduledJobCustomer = instance.scheduledJobCustomer ? [instance.scheduledJobCustomer] : [];
        // }

        // instance.scheduledJobCustomer.unshift(scheduledJob.options.name);
        // instance.scheduledJobCustomer = instance.scheduledJobCustomer.join(',');
        instance.scheduledJobCustomer = scheduledJob.options.name;
        console.log('Scheduled job(Customer): ', instance.scheduledJobCustomer);

      }, {
        scheduled: true, // Set the scheduled option for one-time execution
        timezone: customerDetails.timezone,
      });
      console.log('Scheduled job(Customer): ', scheduledJob);
      console.log('  =>', scheduledJob.options.name);

      // ** SEND AGENT SMS ** //
      if (allotedAgentUser) {
        const agentSmsText = `You have an appointment scheduled on ${appointmentDate} at ${startTime} ${allotedAgentUser.user.timezone}. Please click on the link to join the meeting: ${utilsHelper.generateUrl('join-meeting')}/${instance.id}/agent`;
        await sendSMS(allotedAgentUser.user.phoneNumber, 'USEE360', agentSmsText);
      } else {
        const agentSmsText = `You have an appointment scheduled on ${appointmentDate} at ${startTime} ${agentDetails.timezone}. Please click on the link to join the meeting: ${utilsHelper.generateUrl('join-meeting')}/${instance.id}/agent`;
        await sendSMS(agentDetails.phoneNumber, 'USEE360', agentSmsText);
      }

      // ** SEND AGENT EMAIL ** //
      const scheduledJob2 = cron.schedule(cronExpression, async () => {
        const agentEmailData = [];
        agentEmailData.date = appointmentDate;
        agentEmailData.time = utilsHelper.convertGmtToTime(instance.appointmentTimeGmt, (allotedAgentUser ? allotedAgentUser.user.timezone : agentDetails.timezone), "HH:mm");
        agentEmailData.timezone = allotedAgentUser ? allotedAgentUser.user.timezone : agentDetails.timezone;
        agentEmailData.products = [];
        agentEmailData.allotedAgent = allotedAgentUser?.user?.firstName ? `${allotedAgentUser.user.firstName} ${allotedAgentUser.user.lastName}` : `${agentDetails.firstName} ${agentDetails.lastName}`;
        agentEmailData.companyName = agentDetails.companyName ? agentDetails.companyName : "";
        agentEmailData.agentImage = allotedAgentUser?.user?.profileImage ? allotedAgentUser.user.profileImage : agentDetails.profileImage;
        agentEmailData.agentPhoneNumber = allotedAgentUser?.user?.phoneNumber ? allotedAgentUser.user.phoneNumber : agentDetails.phoneNumber;
        agentEmailData.agentEmail = allotedAgentUser?.user?.email ? allotedAgentUser.user.email : agentDetails.email
        agentEmailData.customer = customerDetails.fullName;
        agentEmailData.customerImage = customerDetails.profileImage;
        agentEmailData.customerPhoneNumber = customerDetails.phoneNumber;
        agentEmailData.customerEmail = customerDetails.email;
        agentEmailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${instance.id}/agent`;
        agentEmailData.contactEmail = process.env.CONTACT_EMAIL;
        agentEmailData.appUrl = process.env.APP_URL;

        const agentEmailHtmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, (allotedAgentUser ? EMAIL_TEMPLATE_PATH.AGENT_UPCOMING_APPOINTMENT : EMAIL_TEMPLATE_PATH.AGENT_UPCOMING_APPOINTMENT)), agentEmailData);
        const agentEmailPayload = {
          to: allotedAgentUser ? allotedAgentUser.user.email : agentDetails.email,
          subject: EMAIL_SUBJECT.UPCOMING_APPOINTMENT,
          html: agentEmailHtmlData,
        }
        mailHelper.sendMail(agentEmailPayload);
        // Optionally store the scheduled job reference for cancellation (see later)
        // Assuming instance.scheduledJob is an array
        // if (!Array.isArray(instance.scheduledJobAgent)) {
        //   instance.scheduledJobAgent = instance.scheduledJobAgent ? [instance.scheduledJobAgent] : [];
        // }

        // instance.scheduledJobAgent.unshift(scheduledJob2.options.name);
        // instance.scheduledJobAgent = instance.scheduledJobAgent.join(',');
        instance.scheduledJobAgent = scheduledJob2.options.name;
        console.log('Scheduled job(Agent): ', instance.scheduledJobAgent);

      }, {
        scheduled: true, // Set the scheduled option for one-time execution
        timezone: allotedAgentUser ? allotedAgentUser.user.timezone : agentDetails.timezone,
      });
      console.log('Scheduled job(Agent): ', scheduledJob2);
      console.log('  =>', scheduledJob2.options.name);
    }
  });

  // eslint-disable-next-line no-unused-vars
  Appointment.addHook('afterCreate', (instance) => {
    //
  });

  Appointment.addHook('beforeDestroy', async (instance) => {
    const { scheduledJobAgent, scheduledJobCustomer } = instance;
    if (scheduledJobCustomer) {
      const deletedJob = cron.destroy(scheduledJobCustomer);
      console.log("DeletedJob(Customer): ", deletedJob);
    }
    if (scheduledJobAgent) {
      const deletedJob = cron.destroy(scheduledJobAgent);
      console.log("DeletedJob(Agent): ", deletedJob);
    }
  });

  return Appointment;
}
