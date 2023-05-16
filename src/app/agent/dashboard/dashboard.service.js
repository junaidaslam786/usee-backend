import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
const { fn, col, where } = require('sequelize');
import { 
  APPOINTMENT_STATUS,
  DASHBOARD_FILTER,
  PRODUCT_STATUS
} from '@/config/constants';
import { utilsHelper } from '@/helpers';

export const dashboardData = async (reqBody, req) => {
  try {
    let totalProperties = 0;
    let totalCompletedAppointment = 0;
    let totalPropertiesSold = 0;
    let totalUpcomingAppointment = 0;

    const { user: agentInfo, dbInstance } = req;
    const {
      filter,
      startDate,
      endDate
    } = reqBody;

    let totalPropertiesWhere = { 
      userId: agentInfo.id, 
      status: { [OP.notIn]: [PRODUCT_STATUS.SOLD, PRODUCT_STATUS.REMOVED, PRODUCT_STATUS.INACTIVE] },
    };

    let totalPropertiesSoldWhere = { 
      userId: agentInfo.id, 
      soldDate: {
        [OP.ne]: null
      }
    };

    let totalCompletedAppointmentWhere = { 
      allotedAgent: agentInfo.id, 
      status: APPOINTMENT_STATUS.COMPLETED,
    };

    let totalUpcomingAppointmentWhere = { 
      allotedAgent: agentInfo.id, 
      status: { [OP.in]: [APPOINTMENT_STATUS.PENDING, APPOINTMENT_STATUS.INPROGRESS] },
    };

    switch(filter) {
      case DASHBOARD_FILTER.CUSTOM:
        totalPropertiesWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [startDate, endDate],
        });
        
        totalPropertiesSoldWhere.soldDate = { [OP.between]: [startDate, endDate] };
        totalCompletedAppointmentWhere.appointmentDate = { [OP.between]: [startDate, endDate] };
        totalUpcomingAppointmentWhere.appointmentDate = { [OP.between]: [startDate, endDate] };

        break;
      case DASHBOARD_FILTER.TODAY:
        const today = utilsHelper.getCustomDate("today");

        totalPropertiesWhere.createdAt = where(fn('date', col('created_at')), OP.eq, today);
        totalPropertiesSoldWhere.soldDate = today;
        totalCompletedAppointmentWhere.appointmentDate = today;
        totalUpcomingAppointmentWhere.appointmentDate = today;

        break;
      case DASHBOARD_FILTER.YESTERDAY:
        const yesterday = utilsHelper.getCustomDate("yesterday");

        totalPropertiesWhere.createdAt = where(fn('date', col('created_at')), OP.eq, yesterday);
        totalPropertiesSoldWhere.soldDate = yesterday;
        totalCompletedAppointmentWhere.appointmentDate = yesterday;
        totalUpcomingAppointmentWhere.appointmentDate = yesterday;

        break;
      case DASHBOARD_FILTER.CURRENT_MONTH:
        const thisMonthStart = utilsHelper.getCustomDate("thisMonthStart");
        const thisMonthEnd = utilsHelper.getCustomDate("thisMonthEnd");
        
        totalPropertiesWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [thisMonthStart, thisMonthEnd],
        });
        totalPropertiesSoldWhere.soldDate = { [OP.between]: [thisMonthStart, thisMonthEnd] };
        totalCompletedAppointmentWhere.appointmentDate =  { [OP.between]: [thisMonthStart, thisMonthEnd] };
        totalUpcomingAppointmentWhere.appointmentDate =  { [OP.between]: [thisMonthStart, thisMonthEnd] };

        break;
      case DASHBOARD_FILTER.PAST_MONTH:
        const lastMonthStart = utilsHelper.getCustomDate("lastMonthStart");
        const lastMonthEnd = utilsHelper.getCustomDate("lastMonthEnd");

        totalPropertiesWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [lastMonthStart, lastMonthEnd],
        });
        totalPropertiesSoldWhere.soldDate = { [OP.between]: [lastMonthStart, lastMonthEnd] };
        totalCompletedAppointmentWhere.appointmentDate = { [OP.between]: [lastMonthStart, lastMonthEnd] };
        totalUpcomingAppointmentWhere.appointmentDate = { [OP.between]: [lastMonthStart, lastMonthEnd] };

        break;
      case DASHBOARD_FILTER.PAST_3_MONTH:
        const startOfPeriod = utilsHelper.getCustomDate("startOfPeriod");
        const endOfPeriod = utilsHelper.getCustomDate("endOfPeriod");

        totalPropertiesWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [startOfPeriod, endOfPeriod],
        });
        totalPropertiesSoldWhere.soldDate = { [OP.between]: [startOfPeriod, endOfPeriod] };
        totalCompletedAppointmentWhere.appointmentDate = { [OP.between]: [startOfPeriod, endOfPeriod] };
        totalUpcomingAppointmentWhere.appointmentDate = { [OP.between]: [startOfPeriod, endOfPeriod] };

        break;
      default:
        break;
    }

    totalProperties = await dbInstance.product.count({ where: totalPropertiesWhere });
    totalPropertiesSold = await dbInstance.product.count({ where: totalPropertiesSoldWhere });
    totalCompletedAppointment = await dbInstance.appointment.count({ where: totalCompletedAppointmentWhere });
    totalUpcomingAppointment = await dbInstance.appointment.count({ where: totalUpcomingAppointmentWhere });

    return {
      totalProperties,
      totalCompletedAppointment,
      totalPropertiesSold,
      totalUpcomingAppointment,
    };
  } catch(err) {
    console.log('dashboardDataServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}