import indexRouter from '../app/home/home.route';
import authRouter from '../app/auth/auth.route';
import userRouter from '../app/user/user.route';
import roleRouter from '../app/role/role.route';
import propertyRouter from '../app/property/property.route';
import agentAlertRouter from '../app/agent/alert/alert.route';
import agentBranchRouter from '../app/agent/branch/branch.route';
import agentUserRouter from '../app/agent/user/user.route';
import appointmentRouter from '../app/appointment/appointment.route'

export default function (app) {
  app.use('/', indexRouter);
  app.use('/auth', authRouter);
  app.use('/user', userRouter);
  app.use('/role', roleRouter);
  app.use('/property', propertyRouter);
  app.use('/agent/alert', agentAlertRouter);
  app.use('/agent/branch', agentBranchRouter);
  app.use('/agent/user', agentUserRouter);
  app.use('/appointment', appointmentRouter);
}
