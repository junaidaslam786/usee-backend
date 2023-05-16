import { Sequelize } from 'sequelize';
const OP = Sequelize.Op;
const { fn, col, where } = require('sequelize');
import { 
  DASHBOARD_FILTER,
  PRODUCT_LOG_TYPE
} from '@/config/constants';
import { utilsHelper } from '@/helpers';

export const dashboardData = async (reqBody, req) => {
  try {
    let totalPropertiesViewed = 0;
    let totalCompletedAppointment = 0;
    let totalPropertiesInWishlist = 0;
    let totalUpcomingAppointment = 0;

    const { user: customerInfo, dbInstance } = req;
    const {
      filter,
      startDate,
      endDate
    } = reqBody;

    let totalPropertiesViewedWhere = { 
      userId: customerInfo.id, 
      logType: PRODUCT_LOG_TYPE.VIEWED,
    };

    let totalPropertiesInWishlistWhere = { 
      customerId: customerInfo.id, 
    };

    let totalCompletedAppointmentWhere = { 
      customerId: customerInfo.id, 
      status: 'completed',
    };

    let totalUpcomingAppointmentWhere = { 
      customerId: customerInfo.id, 
      status: 'pending', 
    };

    switch(filter) {
      case DASHBOARD_FILTER.CUSTOM:
        totalPropertiesViewedWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [startDate, endDate],
        });
        
        totalPropertiesInWishlistWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [startDate, endDate],
        });
        totalCompletedAppointmentWhere.appointmentDate = { [OP.between]: [startDate, endDate] };
        totalUpcomingAppointmentWhere.appointmentDate = { [OP.between]: [startDate, endDate] };

        break;
      case DASHBOARD_FILTER.TODAY:
        const today = utilsHelper.getCustomDate("today");

        totalPropertiesViewedWhere.createdAt = where(fn('date', col('created_at')), OP.eq, today);
        totalPropertiesInWishlistWhere.createdAt = where(fn('date', col('created_at')), OP.eq, today);
        totalCompletedAppointmentWhere.appointmentDate = today;
        totalUpcomingAppointmentWhere.appointmentDate = today;

        break;
      case DASHBOARD_FILTER.YESTERDAY:
        const yesterday = utilsHelper.getCustomDate("yesterday");

        totalPropertiesViewedWhere.createdAt = where(fn('date', col('created_at')), OP.eq, yesterday);
        totalPropertiesInWishlistWhere.createdAt = where(fn('date', col('created_at')), OP.eq, yesterday);
        totalCompletedAppointmentWhere.appointmentDate = yesterday;
        totalUpcomingAppointmentWhere.appointmentDate = yesterday;

        break;
      case DASHBOARD_FILTER.CURRENT_MONTH:
        const thisMonthStart = utilsHelper.getCustomDate("thisMonthStart");
        const thisMonthEnd = utilsHelper.getCustomDate("thisMonthEnd");
        
        totalPropertiesViewedWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [thisMonthStart, thisMonthEnd],
        });
        totalPropertiesInWishlistWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [thisMonthStart, thisMonthEnd],
        });
        totalCompletedAppointmentWhere.appointmentDate =  { [OP.between]: [thisMonthStart, thisMonthEnd] };
        totalUpcomingAppointmentWhere.appointmentDate =  { [OP.between]: [thisMonthStart, thisMonthEnd] };

        break;
      case DASHBOARD_FILTER.PAST_MONTH:
        const lastMonthStart = utilsHelper.getCustomDate("lastMonthStart");
        const lastMonthEnd = utilsHelper.getCustomDate("lastMonthEnd");

        totalPropertiesViewedWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [lastMonthStart, lastMonthEnd],
        });
        totalPropertiesInWishlistWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [lastMonthStart, lastMonthEnd],
        });
        totalCompletedAppointmentWhere.appointmentDate = { [OP.between]: [lastMonthStart, lastMonthEnd] };
        totalUpcomingAppointmentWhere.appointmentDate = { [OP.between]: [lastMonthStart, lastMonthEnd] };

        break;
      case DASHBOARD_FILTER.PAST_3_MONTH:
        const startOfPeriod = utilsHelper.getCustomDate("startOfPeriod");
        const endOfPeriod = utilsHelper.getCustomDate("endOfPeriod");

        totalPropertiesViewedWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [startOfPeriod, endOfPeriod],
        });
        totalPropertiesInWishlistWhere.createdAt = where(fn('date', col('created_at')), {
          [OP.between]: [startOfPeriod, endOfPeriod],
        });
        totalCompletedAppointmentWhere.appointmentDate = { [OP.between]: [startOfPeriod, endOfPeriod] };
        totalUpcomingAppointmentWhere.appointmentDate = { [OP.between]: [startOfPeriod, endOfPeriod] };

        break;
      default:
        break;
    }

    totalPropertiesViewed = await dbInstance.productLog.count({ where: totalPropertiesViewedWhere });
    totalPropertiesInWishlist = await dbInstance.customerWishlist.count({ where: totalPropertiesInWishlistWhere });
    totalCompletedAppointment = await dbInstance.appointment.count({ where: totalCompletedAppointmentWhere });
    totalUpcomingAppointment = await dbInstance.appointment.count({ where: totalUpcomingAppointmentWhere });

    return {
      totalPropertiesViewed,
      totalCompletedAppointment,
      totalPropertiesInWishlist,
      totalUpcomingAppointment,
    };
  } catch(err) {
    console.log('dashboardDataServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}