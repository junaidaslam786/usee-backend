import db from '@/database';
import { opentokHelper, utilsHelper, mailHelper } from '@/helpers';
import * as userService from '../../user/user.service';
import { EMAIL_TEMPLATE_PATH, EMAIL_SUBJECT, USER_TYPE, AGENT_TYPE } from '@/config/constants';
const path = require("path")
const ejs = require("ejs");

export const listAppointments = async (customerInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;

    const { count, rows } = await dbInstance.appointment.findAndCountAll({
      where: { customerId: customerInfo.id },
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
      ],
      order: [["id", "DESC"]],
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
      appointmentTime
    } = req.body;

    const sessionId = await opentokHelper.getSessionId();
    if (!sessionId) {
      return { error: true, message: 'Unable to make appointment due to voice call issue.'}
    }

    const result = await db.transaction(async (transaction) => {
        const prop = await dbInstance.product.findOne({ 
            where: { id: property },
            attributes: ["userId"],
            include: [
              {
                model: dbInstance.user, 
                attributes: ["id", "firstName", "lastName", "email"],
              },
            ]
        });
        console.log(prop.user.email);
        // Create appointment
        const appointment = await dbInstance.appointment.create({
          appointmentDate,
          appointmentTime,
          agentId: prop.userId,
          customerId: req.user.id,
          allotedAgent: prop.userId,
          sessionId,
        }, { transaction });

        // Add products to appointment
        let findProducts = []
        if (appointment && property) {
          findProducts = await dbInstance.product.findAll({ where: { id: property }});
          const productRecords = [];
          findProducts.forEach((product) => {
            productRecords.push({
              appointmentId: appointment.id,
              productId: product.id,
              interest: false,
            });
          });
          await dbInstance.appointment_product.bulkCreate(productRecords, {transaction});
        }

        const emailData = [];
        emailData.date = appointmentDate;
        emailData.time = appointmentTime;
        emailData.products = findProducts;
        emailData.customerImage = req.user.profileImage;
        emailData.customerPhoneNumber = req.user.phoneNumber;
        emailData.customerEmail = req.user.email
        emailData.meetingLink = `${utilsHelper.generateUrl('customer-join-meeting')}/${appointment.id}/customer`;
        emailData.appUrl = process.env.APP_URL;
        const htmlData = await ejs.renderFile(path.join(process.env.FILE_STORAGE_PATH, EMAIL_TEMPLATE_PATH.AGENT_JOIN_APPOINTMENT), emailData);
        const payload = {
          to: prop.user.email,
          subject: EMAIL_SUBJECT.JOIN_APPOINTMENT,
          html: htmlData,
        }
        mailHelper.sendMail(payload);

        return appointment;
    });

    return (result.id) ? await getAppointmentDetailById(req.user, result.id, dbInstance) : result;
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
        appointmentTime
      } = req.body;

      const appointment = await getAppointmentDetailById(req.user, id, dbInstance);
      if (!appointment) {
        return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
      }

      await db.transaction(async (transaction) => {
          const customerDetails = await getOrCreateCustomer(req.user.id, req.body, transaction);
          if (customerDetails?.error && customerDetails?.message) {
            return customerDetails;
          }

          appointment.customerId = customerDetails.customerId;
          appointment.appointmentDate = appointmentDate;
          appointment.appointmentTime = appointmentTime;
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
            await dbInstance.appointment_product.bulkCreate(productRecords, {transaction});
        }
      });

      return true;
  } catch(err) {
    console.log('updateAppointmentServiceError', err)
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
    console.log('dbInstance', dbInstance);
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
        ],
    });
  
    if (!appointment) {
      return false;
    }
  
    return appointment;
}
