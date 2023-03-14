import db from '@/database';
import { opentokHelper } from '@/helpers';

export const listAppointments = async (dbInstance) => {
    try {
        return await dbInstance.appointment.findAll({
            include: [
              {
                model: dbInstance.product, 
                attributes: ["id"],
                through: { attributes: [] }
              },
            ],
        });
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
        customerId,
        customerName, 
        customerEmail, 
        customerPhone, 
        allotedAgent 
      } = req.body;

      if(!customerId) {
        // TODO: Create new customer
      }
      const sessionId = await opentokHelper.getSessionId();
      const result = await db.transaction(async (transaction) => {
          // Create appointment
          const appointment = await dbInstance.appointment.create({
            appointmentDate,
            appointmentTime,
            customerPhoneNumber: customerPhone,
            agentId: req.user.id,
            customerId,
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
            await db.models.appointment_product.bulkCreate(productRecords, {transaction});
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
        } = req.body;
        const appointment = await dbInstance.appointment.findOne({ where: { id: id }});
        if (!appointment) {
            return { error: true, message: 'Invalid appointment id or Appointment do not exist.'}
        }

        await db.transaction(async (transaction) => {
            appointment.appointmentDate = appointmentDate;
            appointment.appointmentTime = appointmentTime;
            await appointment.save({ transaction });

            // remove old permissions
            await appointment.setProducts([]);

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
              await db.models.appointment_product.bulkCreate(productRecords, {transaction});
          }
        });

        return true;
    } catch(err) {
        console.log('createAppointmentServiceError', err)
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
          attributes: ["id"],
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
      } else if (appointment && !appointment.sessionId) {
        return { error: true, message: 'Session id not available for this meeting'}
      }
      const token = await opentokHelper.getSessionEntryToken({firstName:'Zakria'}, '', appointment.sessionId);

      return { token };
  } catch(err) {
      console.log('deleteAppointmentServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
  }
}
