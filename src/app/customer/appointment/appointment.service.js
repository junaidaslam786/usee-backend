import { opentokHelper, utilsHelper } from '@/helpers';

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
