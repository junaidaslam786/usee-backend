export const dashboardData = async (reqBody, req) => {
    try {
        // const { user: agentInfo, dbInstance } = req;
        // const {
        //     filter,
        //     startDate,
        //     endDate
        // } = reqBody;

        

        // return {
        //     totalProperty,
        //     totalCompleted,
        //     totalSold,
        //     ttotalUpcoming,
        // };
    } catch(err) {
      console.log('dashboardDataServiceError', err)
      return { error: true, message: 'Server not responding, please try again later.'}
    }
  }