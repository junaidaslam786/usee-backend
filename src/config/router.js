import indexRouter from '../app/home/home.route';
import authRouter from '../app/auth/auth.route';
import userRouter from '../app/user/user.route';
import roleRouter from '../app/role/role.route';
import propertyRouter from '../app/property/property.route';
import agentAlertRouter from '../app/agent/alert/alert.route';
import agentBranchRouter from '../app/agent/branch/branch.route';
import agentUserRouter from '../app/agent/user/user.route';
import appointmentRouter from '../app/agent/appointment/appointment.route';
import agentAvailabilityRouter from '../app/agent/availability/availability.route';
import categoryRouter from '../app/category/category.route';
import customerWishlistRouter from '../app/customer/wishlist/wishlist.route';
import customerAppointmentRouter from '../app/customer/appointment/appointment.route';
import homePropertyRouter from '../app/home/property/property.route';

export default function (app) {
  app.use('/', indexRouter);
  app.use('/home', indexRouter);
  app.use('/auth', authRouter);
  app.use('/user', userRouter);
  app.use('/role', roleRouter);
  app.use('/property', propertyRouter);
  app.use('/agent/alert', agentAlertRouter);
  app.use('/agent/branch', agentBranchRouter);
  app.use('/agent/user', agentUserRouter);
  app.use('/agent/appointment', appointmentRouter);
  app.use('/agent/availability', agentAvailabilityRouter);
  app.use('/category', categoryRouter);
  app.use('/customer/wishlist', customerWishlistRouter);
  app.use('/customer/appointment', customerAppointmentRouter);
  app.use('/home/property', homePropertyRouter);
}
