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
import moment from 'moment';

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
          whereClause.appointmentDate = moment().startOf('day').format('YYYY-MM-DD');
          break;
        case DASHBOARD_FILTER.YESTERDAY:
          whereClause.appointmentDate = moment().subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
          break;
        case DASHBOARD_FILTER.CURRENT_MONTH:
          whereClause.appointmentDate = {
            [OP.between]: [moment().startOf('month').format('YYYY-MM-DD'), moment().endOf('month').format('YYYY-MM-DD')]
          };
          break;
        case DASHBOARD_FILTER.PAST_MONTH:
          whereClause.appointmentDate = {
            [OP.between]: [moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'), moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD')]
          };
          break;
        case DASHBOARD_FILTER.PAST_3_MONTH:
          whereClause.appointmentDate = {
            [OP.between]: [moment().subtract(3, 'month').startOf('day').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
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
          attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
        },
        { 
          model: dbInstance.agentTimeSlot, 
        },
        { 
          model: dbInstance.appointmentNote, 
          where: { customerId: customerInfo.id },
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
      timeSlotId
    } = req.body;

    const sessionId = await opentokHelper.getSessionId();
    if (!sessionId) {
      return { error: true, message: 'Unable to make appointment due to voice call issue.'}
    }

    const timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: timeSlotId } });
    if (!timeSlot) {
      return { error: true, message: 'Invalid time selected.' };
    }

    const isTimeExpired = utilsHelper.checkIfTimeIsOld(appointmentDate, timeSlot.fromTime);
    if (isTimeExpired) {
      return { error: true, message: 'Time is expired. Please select another timeslot.' };
    }

    const propertyDetail = await dbInstance.product.findOne({ 
      where: { id: property },
      attributes: ["id", "userId"],
      include: [
        {
          model: dbInstance.user, 
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ]
    });
    if (!propertyDetail) {
      return { error: true, message: 'Invalid property id or property do not exist.' };
    }

    let agentSupervisor = null;
    if (req.body.isAssignedToSupervisor) {
      agentSupervisor = await dbInstance.agent.findOne({
        where: { managerId: propertyDetail.userId },
        include: [{
          model: dbInstance.user, 
          attributes: ["firstName", "lastName", "email", "profileImage", "phoneNumber"]
        }],
      });

      if (!agentSupervisor) {
        return { error: true, message: `${process.env.AGENT_ENTITY_LABEL} has not added any supervisor yet. Please select another slot for agent.` };
      }

      // Check if there's an existing appointment
      const existingAppointment = await dbInstance.appointment.findOne({
        where: {
          allotedAgent: agentSupervisor.userId,
          appointmentDate: appointmentDate,
          timeSlotId: timeSlotId
        }
      });

      if (existingAppointment) {
        return { error: true, message: 'Supervisor already has an appointment at this slot, please select another slot.' };
      }
    } else {
      // Check if there's an existing appointment
      const existingAppointment = await dbInstance.appointment.findOne({
        where: {
          agentId: propertyDetail.userId,
          appointmentDate: appointmentDate,
          timeSlotId: timeSlotId
        }
      });

      if (existingAppointment) {
        return { error: true, message: `${process.env.AGENT_ENTITY_LABEL} already has an appointment at this slot, please select another slot.` };
      }
    }

    let customerDetails = req.user;
    let isNewCustomer = false;
    const tempPassword = utilsHelper.generateRandomString(10);
    
    const result = await db.transaction(async (transaction) => {
      if (!customerDetails) {
        customerDetails = await userService.createUserWithPassword({
          firstName: req.body.customerFirstName,
          lastName: req.body.customerLastName,
          email: req.body.customerEmail.toLowerCase(),
          password: tempPassword,
          status: true,
          userType: USER_TYPE.CUSTOMER,
        }, transaction);

        isNewCustomer = true;
      }

      if (!customerDetails) {
        return { error: true, message: 'No customer exist to add wishlist.'}
      }

      // Create appointment
      const appointment = await dbInstance.appointment.create({
        appointmentDate,
        timeSlotId,
        agentId: propertyDetail.userId,
        customerId: customerDetails.id,
        allotedAgent: agentSupervisor ? agentSupervisor.userId : propertyDetail.userId,
        sessionId,
      }, { transaction });

      // create agent alert
      await dbInstance.userAlert.create({
        customerId: customerDetails.id,
        productId: property,
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

        if (agentSupervisor?.userId) {
          // Fetch the existing allocation for the supervisor
          const existingAllocations = await dbInstance.productAllocation.findOne({
            where: {
              userId: agentSupervisor.userId,
              productId: propertyDetail.id,
            },
          });

          if (!existingAllocations) {
            await dbInstance.productAllocation.create({
              userId: agentSupervisor.userId,
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

      const emailData = [];
      emailData.date = appointmentDate;
      emailData.time = timeSlot.textShow;
      emailData.products = [propertyDetail];
      emailData.customer = customerDetails.fullName;
      emailData.customerImage = customerDetails.profileImage;
      emailData.customerPhoneNumber = customerDetails.phoneNumber;
      emailData.customerEmail = customerDetails.email;
      emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
      emailData.appUrl = process.env.APP_URL;
      const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.AGENT_JOIN_APPOINTMENT), emailData);
      const payload = {
        to: agentSupervisor?.user?.email ? agentSupervisor.user.email : propertyDetail.user.email,
        subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
        html: htmlData,
      }
      mailHelper.sendMail(payload);

      return appointment;
    });

    return (result.id) ? await getAppointmentDetailById(customerDetails, result.id, dbInstance) : result;
  } catch(err) {
    console.log('createAppointmentServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}

// this needs to be re-write
// export const updateAppointment = async (req, dbInstance) => {
//   try {
//       const { 
//         id,
//         properties, 
//         appointmentDate, 
//         appointmentTime
//       } = req.body;

//       const appointment = await getAppointmentDetailById(req.user, id, dbInstance);
//       if (!appointment) {
//         return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
//       }

//       await db.transaction(async (transaction) => {
//           const customerDetails = await getOrCreateCustomer(req.user.id, req.body, transaction);
//           if (customerDetails?.error && customerDetails?.message) {
//             return customerDetails;
//           }

//           appointment.customerId = customerDetails.customerId;
//           appointment.appointmentDate = appointmentDate;
//           appointment.appointmentTime = appointmentTime;
//           await appointment.save({ transaction });

//           // remove old properties
//           await appointment.setProducts([]);

//           // Add properties to appointment
//           if (appointment && properties) {
//             const findProducts = await dbInstance.product.findAll({ where: { id: properties }});
//             const productRecords = [];
//             findProducts.forEach((product) => {
//               productRecords.push({
//                 appointmentId: appointment.id,
//                 productId: product.id,
//                 interest: false,
//               });
//             });
//             await dbInstance.appointmentProduct.bulkCreate(productRecords, {transaction});
//         }
//       });

//       return true;
//   } catch(err) {
//     console.log('updateAppointmentServiceError', err)
//     return { error: true, message: 'Server not responding, please try again later.'}
//   }
// }

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
            attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
          },
          { 
            model: dbInstance.user, 
            as: 'agentUser',
            attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
          },
          { 
            model: dbInstance.user, 
            as: 'allotedAgentUser',
            attributes: ["firstName", "lastName", "email", "phoneNumber", "profileImage"],
          },
          { 
            model: dbInstance.agentTimeSlot, 
          },
          { 
            model: dbInstance.appointmentNote, 
            where: { customerId: user.id },
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
