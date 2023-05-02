export const dashboardData = async (reqBody, req) => {
  try {
    let totalProperty = totalCompleted = totalSold = ttotalUpcoming = 0;
    const { user: agentInfo, dbInstance } = req;
    const {
        filter,
        startDate,
        endDate
    } = reqBody;

    switch(filter) {
      case DASHBOARD_FILTER.CUSTOM:
        break;
      case DASHBOARD_FILTER.TODAY:
        break;
      case DASHBOARD_FILTER.YESTERDAY:
        break;
      case DASHBOARD_FILTER.CURRENT_MONTH:
        break;
      case DASHBOARD_FILTER.PAST_MONTH:
        break;
      case DASHBOARD_FILTER.PAST_3_MONTH:
        break;
      default:
        break;
    }

    return {
      totalProperty,
      totalCompleted,
      totalSold,
      ttotalUpcoming,
    };
  } catch(err) {
    console.log('dashboardDataServiceError', err)
    return { error: true, message: 'Server not responding, please try again later.'}
  }
}