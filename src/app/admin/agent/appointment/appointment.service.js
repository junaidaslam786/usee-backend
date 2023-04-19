import {
  AGENT_TYPE
} from '@/config/constants';

export const listCompletedAppointments = async (agentInfo, reqBody, dbInstance) => {
  try {
    const { rows } = await dbInstance.appointment.findAndCountAll({
      include: [
        {
          model: dbInstance.product,
          attributes: ['id'],
          through: { attributes: [] },
        },
        {
          model: dbInstance.user,
          as: 'customerUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },
        {
          model: dbInstance.user,
          as: 'agentUser',
          attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
        },

      ],
      order: [['id', 'DESC']],

    });

    return {
      data: rows,
    };
  } catch (err) {
    console.log('listAppointmentsServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

const getAppointmentDetailById = async (user, appointmentId, dbInstance) => {
  const whereClause = user.agentType == AGENT_TYPE.AGENT ? { id: appointmentId, agentId: user.id } : { id: appointmentId, allotedAgent: user.id };
  const appointment = await dbInstance.appointment.findOne({
    where: whereClause,
    include: [
      {
        model: dbInstance.product,
        attributes: ['id', 'title', 'description', 'price', 'featuredImage'],
        through: { attributes: [] },
      },
      {
        model: dbInstance.user,
        as: 'customerUser',
        attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
      },
      {
        model: dbInstance.user,
        as: 'agentUser',
        attributes: ['firstName', 'lastName', 'email', 'phoneNumber', 'profileImage'],
      },
    ],
  });

  if (!appointment) {
    return false;
  }

  return appointment;
};

export const deleteAppointment = async (appointmentId, req) => {
  try {
    const { user, dbInstance } = req;
    const appointment = await getAppointmentDetailById(user, appointmentId, dbInstance);
    if (!appointment) {
      return { error: true, message: 'Invalid appointment id or Appointment do not exist.' };
    }

    await dbInstance.appointment.destroy({
      where: {
        id: appointmentId,
      },
    });

    return true;
  } catch (err) {
    console.log('deleteAppointmentServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

