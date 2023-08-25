import indexRouter from '../app/home/home.route';
import authRouter from '../app/auth/auth.route';
import superAdminAuthRouter from '../app/superAdmin/auth/auth.route';
import superAdminUserRouter from '../app/superAdmin/user/user.route'
import adminAuthRouter from '../app/admin/auth/auth.route';
import userRouter from '../app/user/user.route';
import adminUserRouter from '../app/admin/user/user.route';
import adminNewsRouter from '../app/admin/cms/pages/cms.route';
import adminCommunityRouter from '../app/admin/cms/community/community.route';
import roleRouter from '../app/role/role.route';
import propertyRouter from '../app/property/property.route';
import adminPropertyRouter from '../app/admin/property/property.route';
import superAdminPropertyRouter from '../app/superAdmin/property/property.route';
import agentAlertRouter from '../app/agent/alert/alert.route';
import agentBranchRouter from '../app/agent/branch/branch.route';
import agentUserRouter from '../app/agent/user/user.route';
import appointmentRouter from '../app/agent/appointment/appointment.route';
import adminAppointmentRouter from '../app/admin/agent/appointment/appointment.route';
import adminagentRouter from '../app/admin/agent/user/user.route';
import agentAvailabilityRouter from '../app/agent/availability/availability.route';
import agentDashboardRouter from '../app/agent/dashboard/dashboard.route';
import categoryRouter from '../app/category/category.route';
import customerWishlistRouter from '../app/customer/wishlist/wishlist.route';
import customerAppointmentRouter from '../app/customer/appointment/appointment.route';
import customerDashboardRouter from '../app/customer/dashboard/dashboard.route';
import homePropertyRouter from '../app/home/property/property.route';
import iframeRouter from '../app/iframe/iframe.route';
import cmsRouter from '../app/home/cms/cms.route';

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
  app.use('/agent/dashboard', agentDashboardRouter);
  app.use('/category', categoryRouter);
  app.use('/customer/wishlist', customerWishlistRouter);
  app.use('/customer/appointment', customerAppointmentRouter);
  app.use('/customer/dashboard', customerDashboardRouter);
  app.use('/home/property', homePropertyRouter);
  app.use('/iframe', iframeRouter);
  app.use('/cms', cmsRouter);

  // Admin Routes

  // Login and Register
  app.use('/admin', adminUserRouter);

  app.use('/admin/auth', adminAuthRouter);
  app.use('/admin/agent', adminagentRouter);
  app.use('/admin/cms/page', adminNewsRouter);
  app.use('/admin/cms/community', adminCommunityRouter);
  app.use('/admin/property', adminPropertyRouter);
  app.use('/admin/appointment', adminAppointmentRouter);

  // Super Admin Routes
  app.use('/superadmin', superAdminUserRouter);
  app.use('/superadmin/auth', superAdminAuthRouter);
  app.use('/superadmin/user', superAdminUserRouter);
  app.use('/superadmin/property', superAdminPropertyRouter);
}