import db from '@/database';
import { opentokHelper, utilsHelper } from '@/helpers';
import * as userService from '../../user/user.service';
import { USER_TYPE } from '@/config/constants'
const {
  HOME_PANEL_URL
} = process.env;

export const listAppointments = async (agentInfo, reqBody, dbInstance) => {
  try {
    const itemPerPage = (reqBody && reqBody.size) ? reqBody.size : 10;
    const page = (reqBody && reqBody.page) ? reqBody.page : 1;

    const { count, rows } = await dbInstance.appointment.findAndCountAll({
      where: { agentId: agentInfo.id },
      include: [{ 
        model: dbInstance.product, 
        attributes: ["id"],
        through: { attributes: [] }
      }],
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

export const getAppointment = async (appointmentId, dbInstance) => {
  try {
    const appoinment = await getAppointmentDetailById(appointmentId, dbInstance);
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
        products, 
        appointmentDate, 
        appointmentTime,
        allotedAgent 
      } = req.body;

      const sessionId = await opentokHelper.getSessionId();
      if (!sessionId) {
        return { error: true, message: 'Unable to make appointment due to voice call issue.'}
      }

      const result = await db.transaction(async (transaction) => {
          const customerDetails = await getOrCreateCustomer(req.user.id, req.body, transaction);
          if (customerDetails?.error && customerDetails?.message) {
            return customerDetails;
          }

          // Create appointment
          const appointment = await dbInstance.appointment.create({
            appointmentDate,
            appointmentTime,
            agentId: req.user.id,
            customerId: customerDetails.id,
            allotedAgent: allotedAgent,
            sessionId,
          }, { transaction });

          // Add products to appointment
          if (appointment && products) {
            const findProducts = await dbInstance.product.findAll({ where: { id: products }});
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

          return appointment;
      });

      return (result.id) ? await getAppointmentDetailById(result.id, dbInstance) : result;
    } catch(err) {
      console.log('createAppointmentServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const updateAppointment = async (req, dbInstance) => {
    try {
        const { 
          id,
          products, 
          appointmentDate, 
          appointmentTime,
          allotedAgent 
        } = req.body;

        const appointment = await getAppointmentDetailById(id, dbInstance);
        if (!appointment) {
          return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
        }

        await db.transaction(async (transaction) => {
            const customerDetails = await getOrCreateCustomer(req.user.id, req.body, transaction);
            if (customerDetails?.error && customerDetails?.message) {
              return customerDetails;
            }

            appointment.allotedAgent = allotedAgent;
            appointment.customerId = customerDetails.customerId;
            appointment.appointmentDate = appointmentDate;
            appointment.appointmentTime = appointmentTime;
            await appointment.save({ transaction });

            // remove old properties
            await appointment.setProducts([]);

            // Add properties to appointment
            if (appointment && products) {
              const findProducts = await dbInstance.product.findAll({ where: { id: products }});
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

export const deleteAppointment = async (appointmentId, dbInstance) => {
    try {
        const appointment = await getAppointmentDetailById(appointmentId, dbInstance);
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

const getAppointmentDetailById = async (appointmentId, dbInstance) => {
  const appointment = await dbInstance.appointment.findOne({
      where: { id: appointmentId },
      include: [
        {
          model: dbInstance.product,
          attributes: ["id", "title", "description", "price"],
          through: { attributes: [] }
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
  const customerId = reqBody.customerId;
  if (customerId) {
    customerDetails = await userService.getUserById(customerId);
    if (!customerDetails) {
      return { error: true, message: 'Invalid customer id or customer do not exist.'}
    }

    return customerDetails;
  }

  if (!customerId && reqBody.customerEmail) {
    let customerDetails = await userService.getUserByEmail(reqBody.customerEmail);
    if (customerDetails && customerDetails.userType != USER_TYPE.CUSTOMER) {
      return { error: true, message: 'User is not registered as customer in our platform. Try another email.'}
    } else if (!customerDetails) {
      const tempPassword = utilsHelper.generateRandomString(10);
      customerDetails = await userService.createUserWithPassword({
        firstName: reqBody.customerFirstName,
        lastName: reqBody.customerLastName,
        email: reqBody.customerEmail,
        phoneNumber: reqBody.customerPhone,
        password: tempPassword,
        status: true,
        userType: USER_TYPE.CUSTOMER,
        createdBy: agentId,
      }, transaction);

      const loginLink = HOME_PANEL_URL + 'auth/login';
      const payload = {
        to: reqBody.customerEmail,
        subject: `Agent has added you as a customer to Usee360`,
        html: `<p>Hello,</p> <p>Thank you for registering with us</p> <p>Click on the link below to login with temporary password</p> <p>Your Temporary Password: ${tempPassword}</p> <p><a href="${loginLink}" target="_blank">Login</a></p>`
      }
      customerDetails.sendMail(payload);

      return customerDetails;
    }

    return customerDetails
  }
}
