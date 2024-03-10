// General Routes
import authRouter from '../app/auth/auth.route';
import categoryRouter from '../app/category/category.route';
import cmsRouter from '../app/home/cms/cms.route';
import featureRouter from '../app/feature/feature.route';
import homePropertyRouter from '../app/home/property/property.route';
import iframeRouter from '../app/iframe/iframe.route';
import indexRouter from '../app/home/home.route';
import propertyRouter from '../app/property/property.route';
import roleRouter from '../app/role/role.route';
import userRouter from '../app/user/user.route';

// Customer Routes
import customerAlertRouter from '../app/customer/alert/alert.route';
import customerAppointmentRouter from '../app/customer/appointment/appointment.route';
import customerDashboardRouter from '../app/customer/dashboard/dashboard.route';
import customerWishlistRouter from '../app/customer/wishlist/wishlist.route';

// Agent Routes
import agentAlertRouter from '../app/agent/alert/alert.route';
import agentAnalyticsRouter from '../app/agent/analytics/analytics.route';
import agentAvailabilityRouter from '../app/agent/availability/availability.route';
import agentBranchRouter from '../app/agent/branch/branch.route';
import agentDashboardRouter from '../app/agent/dashboard/dashboard.route';
import agentReportsRouter from '../app/agent/reports/reports.route';
import agentUserRouter from '../app/agent/user/user.route';
import appointmentRouter from '../app/agent/appointment/appointment.route';

// Super Admin Routes
import superAdminAgentRouter from '../app/superAdmin/agent/user/user.route';
import superAdminAlertRouter from '../app/superAdmin/alert/alert.route';
import superAdminAnalticsRouter from '../app/superAdmin/analytics/analytics.route';
import superAdminAppConfigurationRouter from '../app/superAdmin/appConfiguration/appConfiguration.route';
import superAdminAppointmentRouter from '../app/superAdmin/appointment/appointment.route';
import superAdminAuthRouter from '../app/superAdmin/auth/auth.route';
import superAdminCmsCommunityRouter from '../app/superAdmin/cms/community/community.route';
import superAdminFeatureRouter from '../app/superAdmin/feature/feature.route';
import superAdminNewsRouter from '../app/superAdmin/cms/pages/cms.route';
import superAdminPropertyRouter from '../app/superAdmin/property/property.route';
import superAdminReportsRouter from '../app/superAdmin/reports/reports.route';
import superAdminSearchRouter from '../app/superAdmin/search/search.route';
import superAdminSubscriptionRouter from '../app/superAdmin/subscription/subscription.route';
import superAdminTokenRouter from '../app/superAdmin/token/token.route';
import superAdminUserRouter from '../app/superAdmin/user/user.route'

// Admin Routes
import adminAgentRouter from '../app/admin/agent/user/user.route';
import adminAppointmentRouter from '../app/admin/agent/appointment/appointment.route';
import adminAuthRouter from '../app/admin/auth/auth.route';
import adminCommunityRouter from '../app/admin/cms/community/community.route';
import adminNewsRouter from '../app/admin/cms/pages/cms.route';
import adminPropertyRouter from '../app/admin/property/property.route';
import adminUserRouter from '../app/admin/user/user.route';

export default function (app) {
  app.use('/', indexRouter);
  app.use('/agent/alert', agentAlertRouter);
  app.use('/agent/analytics', agentAnalyticsRouter);
  app.use('/agent/appointment', appointmentRouter);
  app.use('/agent/availability', agentAvailabilityRouter);
  app.use('/agent/branch', agentBranchRouter);
  app.use('/agent/dashboard', agentDashboardRouter);
  app.use('/agent/reports', agentReportsRouter);
  app.use('/agent/user', agentUserRouter);
  app.use('/auth', authRouter);
  app.use('/category', categoryRouter);
  app.use('/cms', cmsRouter);
  app.use('/customer/alert', customerAlertRouter);
  app.use('/customer/appointment', customerAppointmentRouter);
  app.use('/customer/dashboard', customerDashboardRouter);
  app.use('/customer/wishlist', customerWishlistRouter);
  app.use('/feature', featureRouter);
  app.use('/home', indexRouter);
  app.use('/home/property', homePropertyRouter);
  app.use('/iframe', iframeRouter);
  app.use('/property', propertyRouter);
  app.use('/role', roleRouter);
  app.use('/user', userRouter);

  // Subscription Routes
  // app.use('/api/subscription', subscriptionRoutes);

  // Login and Register
  app.use('/admin', adminUserRouter);
  app.use('/admin/agent', adminAgentRouter);
  app.use('/admin/appointment', adminAppointmentRouter);
  app.use('/admin/auth', adminAuthRouter);
  app.use('/admin/cms/page', adminNewsRouter);
  app.use('/admin/cms/community', adminCommunityRouter);
  app.use('/admin/property', adminPropertyRouter);

  // Super Admin Routes
  app.use('/superadmin', superAdminUserRouter);
  app.use('/superadmin/agent', superAdminAgentRouter);
  app.use('/superadmin/alert', superAdminAlertRouter);
  app.use('/superadmin/analytics', superAdminAnalticsRouter);
  app.use('/superadmin/appointment', superAdminAppointmentRouter);
  app.use('/superadmin/auth', superAdminAuthRouter);
  app.use('/superadmin/cms/community', superAdminCmsCommunityRouter);
  app.use('/superadmin/cms/page', superAdminNewsRouter);
  app.use('/superadmin/config', superAdminAppConfigurationRouter);
  app.use('/superadmin/feature', superAdminFeatureRouter);
  app.use('/superadmin/property', superAdminPropertyRouter);
  app.use('/superadmin/reports', superAdminReportsRouter);
  app.use('/superadmin/search', superAdminSearchRouter);
  app.use('/superadmin/subscription', superAdminSubscriptionRouter);
  app.use('/superadmin/token', superAdminTokenRouter);
  app.use('/superadmin/user', superAdminUserRouter);
}