import db from '@/database';
import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
import { opentokHelper, utilsHelper, mailHelper } from '@/helpers';
import * as userService from '../../user/user.service';
import { 
  EMAIL_TEMPLATE_PATH, 
  EMAIL_SUBJECT, 
  USER_TYPE, 
  AGENT_TYPE, 
  APPOINTMENT_STATUS, 
  APPOINTMENT_LOG_TYPE,
  APPOINTMENT_TYPES,
  DASHBOARD_FILTER
} from '@/config/constants';
const path = require("path")
const ejs = require("ejs");
import moment from 'moment';

export const listAppointments = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;
    const appointmentType = (reqBody && reqBody.type) ? reqBody.type : APPOINTMENT_TYPES.UPCOMING;

    const whereClause = agentInfo.agent.agentType == AGENT_TYPE.AGENT ? { agentId: agentInfo.id } : { allotedAgent: agentInfo.id };
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
          as: 'customerUser',
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
          where: { agentId: agentInfo.id },
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
    const appoinment = await getAppointmentDetailById(user.agent, appointmentId, dbInstance);
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
        properties, 
        appointmentDate, 
        timeSlotId
      } = req.body;

      const sessionId = await opentokHelper.getSessionId();
      if (!sessionId) {
        return { error: true, message: 'Unable to make appointment due to voice call issue.' };
      }
      
      const timeSlot = await dbInstance.agentTimeSlot.findOne({ where: { id: timeSlotId } });
      if (!timeSlot) {
        return { error: true, message: 'Invalid time selected.' };
      }

      const isTimeExpired = utilsHelper.checkIfTimeIsOld(appointmentDate, timeSlot.fromTime);
      if (isTimeExpired) {
        return { error: true, message: 'Time is expired. Please select another timeslot.' };
      }

      let agentSupervisor = null;
      if (req.body.isAssignedToSupervisor) {
        agentSupervisor = await dbInstance.agent.findOne({
          where: { managerId: req.user.id },
          include: [{
            model: dbInstance.user, 
            attributes: ["firstName", "lastName", "email", "profileImage", "phoneNumber"]
          }],
        });

        if (!agentSupervisor) {
          return { error: true, message: 'Please add supervisor in account details.' };
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
            agentId: req.user.id,
            appointmentDate: appointmentDate,
            timeSlotId: timeSlotId
          }
        });

        if (existingAppointment) {
          return { error: true, message: `${process.env.AGENT_ENTITY_LABEL} already has an appointment at this slot, please select another slot.` };
        }
      }

      const result = await db.transaction(async (transaction) => {
          const customerDetails = await getOrCreateCustomer(req.user.id, req.body, transaction);
          if (customerDetails?.error && customerDetails?.message) {
            return customerDetails;
          }

          // Create appointment
          const appointment = await dbInstance.appointment.create({
            appointmentDate,
            timeSlotId,
            agentId: req.user.id,
            customerId: customerDetails.id,
            allotedAgent: agentSupervisor ? agentSupervisor.userId : req.user.id,
            sessionId,
          }, { transaction });

          // Add products to appointment
          let findProducts = []
          let allocatedUsers = [];
          if (appointment && properties) {
            findProducts = await dbInstance.product.findAll({ where: { id: properties }});

            if (agentSupervisor?.userId) {
              // Fetch the existing allocations for the supervisor
              const existingAllocations = await dbInstance.productAllocation.findAll({
                where: {
                  userId: agentSupervisor.userId,
                  productId: properties,
                },
              });

              // Create a Set of existing productIds allocated to the supervisor
              const existingProductIds = new Set(existingAllocations.map((allocation) => allocation.productId));

              // Filter the products that are not already allocated to the supervisor
              const unAllocatedProducts = findProducts.filter((product) => !existingProductIds.has(product.id));

              // Create the new allocations
              allocatedUsers = unAllocatedProducts.map((product) => ({
                productId: product.id,
                userId: agentSupervisor.userId,
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
              await dbInstance.appointmentProduct.bulkCreate(productRecords, {transaction});
            }
            
            if (allocatedUsers.length > 0) {
              await dbInstance.productAllocation.bulkCreate(allocatedUsers, { transaction });
            }
          }

          // customer email
          const emailData = [];
          emailData.date = appointmentDate;
          emailData.time = timeSlot.textShow;
          emailData.products = findProducts;
          emailData.allotedAgent = agentSupervisor?.user?.lastName ? `${agentSupervisor.user.firstName} ${agentSupervisor.user.lastName}` : req.user.fullName;
          emailData.companyName = req.user?.agent?.companyName ? req.user.agent.companyName : "";
          emailData.agentImage = agentSupervisor?.user?.profileImage ? agentSupervisor.user.profileImage : req.user.profileImage;
          emailData.agentPhoneNumber = agentSupervisor?.user?.phoneNumber ? agentSupervisor.user.phoneNumber : req.user.phoneNumber;
          emailData.agentEmail = agentSupervisor?.user?.email ? agentSupervisor.user.email : req.user.email
          emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/customer`;
          emailData.appUrl = process.env.APP_URL;
          const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.JOIN_APPOINTMENT), emailData);
          const payload = {
            to: customerDetails.email,
            subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
            html: htmlData,
          }
          mailHelper.sendMail(payload);

          // supervisor email
          if (agentSupervisor) {
            const emailData = [];
            emailData.date = appointmentDate;
            emailData.time = timeSlot.textShow;
            emailData.products = findProducts;
            emailData.primaryAgent = req.user.fullName;
            emailData.customer = customerDetails.fullName;
            emailData.customerImage = customerDetails.profileImage;
            emailData.customerPhoneNumber = customerDetails.phoneNumber;
            emailData.customerEmail = customerDetails.email;
            emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/agent`;
            emailData.appUrl = process.env.APP_URL;
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.SUPERVISOR_JOIN_APPOINTMENT), emailData);
            const payload = {
              to: agentSupervisor.user.email,
              subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
              html: htmlData,
            }
            mailHelper.sendMail(payload);
          }

          return appointment;
      });

      return (result.id) ? await getAppointmentDetailById((agentSupervisor ? agentSupervisor : req.user.agent), result.id, dbInstance) : result;
    } catch(err) {
      console.log('createAppointmentServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateAppointment = async (req, dbInstance) => {
    try {
        const { 
          id,
          properties, 
          appointmentDate, 
          timeSlotId
        } = req.body;

        const appointment = await getAppointmentDetailById(req.user.agent, id, dbInstance);
        if (!appointment) {
          return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
        }

        const timeSlot = dbInstance.agentTimeSlot.findOne({ where: { id: timeSlotId} });
        if (!timeSlot) {
          return { error: true, message: 'Invalid time selected.' };
        }

        const vars = utilsHelper.checkIfTimeIsOld(appointmentDate, timeSlot.fromTime);
        if (vars) {
          return { error: true, message: 'Time is expired. Please select another timeslot.' };
        }

        await db.transaction(async (transaction) => {
            const customerDetails = await getOrCreateCustomer(req.user.id, req.body, transaction);
            if (customerDetails?.error && customerDetails?.message) {
              return customerDetails;
            }

            appointment.customerId = customerDetails.customerId;
            appointment.appointmentDate = appointmentDate;
            appointment.timeSlotId = timeSlotId;
            await appointment.save({ transaction });

            // remove old properties
            await appointment.setProducts([]);

            // Add properties to appointment
            if (appointment && properties) {
              const findProducts = await dbInstance.product.findAll({ where: { id: properties }});
              const productRecords = [];
              findProducts.forEach((product) => {
                productRecords.push({
                  appointmentId: appointment.id,
                  productId: product.id,
                  interest: false,
                });
              });
              await dbInstance.appointmentProduct.bulkCreate(productRecords, {transaction});
            }

            const emailData = [];
            emailData.date = appointmentDate;
            emailData.time = timeSlot.textShow;
            emailData.products = findProducts;
            emailData.allotedAgent = req.user.fullName;
            emailData.companyName = req.user?.agent?.companyName ? req.user.agent.companyName : "";
            emailData.agentImage = req.user.profileImage;
            emailData.agentPhoneNumber = req.user.phoneNumber;
            emailData.agentEmail = req.user.email
            emailData.meetingLink = `${utilsHelper.generateUrl('join-meeting')}/${appointment.id}/customer`;
            emailData.appUrl = process.env.APP_URL;
            const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.JOIN_APPOINTMENT), emailData);
            const payload = {
              to: customerDetails.email,
              subject: EMAIL_SUBJECT.UPDATE_JOIN_APPOINTMENT,
              html: htmlData,
            }
            mailHelper.sendMail(payload);
        });

        return true;
    } catch(err) {
      console.log('updateAppointmentServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const deleteAppointment = async (appointmentId, req) => {
    try {
        const { user, dbInstance } = req;
        const appointment = await getAppointmentDetailById(user.agent, appointmentId, dbInstance);
        if (!appointment) {
          return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
        }

        await dbInstance.appointment.destroy({
            where: {
              id: appointmentId
            }
        });

        return true;
    } catch(err) {
        console.log('deleteAppointmentServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

const getAppointmentDetailById = async (agent, appointmentId, dbInstance) => {
  const whereClause = agent.agentType == AGENT_TYPE.AGENT ? { id: appointmentId, agentId: agent.userId } : { id: appointmentId, allotedAgent: agent.userId };
  const appointment = await dbInstance.appointment.findOne({
      where: whereClause,
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
          where: { agentId: agent.userId },
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

const getOrCreateCustomer = async (agentId, reqBody, transaction) => {
  let customerDetails;
  const customerId = reqBody.customerId;
  if (customerId) {
    customerDetails = await userService.getUserById(customerId);
    if (!customerDetails) {
      return { error: true, message: 'Invalid customer id or customer do not exist.'}
    }

    return customerDetails;
  }

  if (!customerId && reqBody.customerEmail) {
    customerDetails = await userService.getUserByEmail(reqBody.customerEmail);
    if (customerDetails && customerDetails.userType != USER_TYPE.CUSTOMER) {
      return { error: true, message: 'User is not registered as customer in our platform. Try another email.'}
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

export const updateStatus = async (reqBody, dbInstance) => {
  try {
    const { id, status } = reqBody;

    const appointment = await dbInstance.appointment.findOne({
      where: { id },
      attributes: ['id']
    });

    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.'};
    } 

    if (!Object.values(APPOINTMENT_STATUS).includes(status)) {
      return { error: true, message: 'Invalid status.'};
    } 
    
    appointment.status = status;
    if (status === APPOINTMENT_STATUS.INPROGRESS) {
      appointment.startMeetingTime = Date.now();
    }

    if (status === APPOINTMENT_STATUS.COMPLETED) {
      appointment.endMeetingTime = Date.now();
    }

    await appointment.save();

    return true;
  } catch(err) {
    console.log('updateStatusServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
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
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.'};
    } 

    if (!Object.values(APPOINTMENT_LOG_TYPE).includes(logType)) {
      return { error: true, message: 'Invalid log type.'};
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
  } catch(err) {
    console.log('addLogServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
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
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.'};
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
  } catch(err) {
    console.log('addNoteServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}
