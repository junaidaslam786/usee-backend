export const whitelistRegex = [
  // '/agent/alert' route
  {
    path: new RegExp('^\\/agent\\/alert\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  // '/agent/appointment' routes
  {
    path: new RegExp('^\\/agent\\/appointment\\/session-token\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/agent\\/appointment\\/session-details\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/agent\\/appointment\\/download-archive\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/agent\\/appointment\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/agent\\/appointment\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  // '/agent/branch' routes
  {
    path: new RegExp('^\\/agent\\/branch\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/agent\\/branch\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  // '/agent/user' routes
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  }, // DELETE agent user by id
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/subscriptions$'),
    method: 'GET',
  }, // GET user subscriptions by userId
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/subscription$'),
    method: 'PUT',
  }, // PUT update subscription
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/subscribe$'),
    method: 'POST',
  }, // POST subscribe user
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/tokens$'),
    method: 'GET',
  }, // GET user tokens
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/token-transactions$'),
    method: 'GET',
  }, // GET token transactions
  {
    path: new RegExp('^\\/agent\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/token-transaction$'),
    method: 'POST',
  }, // POST token transaction
  // '/category' routes
  {
    path: new RegExp('^\\/category\\/([0-9]+)$'), // Matches /category/<integer>
    method: 'GET',
  },
  // '/config' route
  {
    path: new RegExp('^\\/config\\/([a-zA-Z0-9_]+)$'), // Matches /config/<configKey>
    method: 'GET',
  },
  // '/customer/alert' route
  {
    path: new RegExp('^\\/customer\\/alert\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  // '/customer/appointment' routes
  {
    path: new RegExp('^\\/customer\\/appointment\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  {
    path: new RegExp('^\\/customer\\/appointment\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/customer\\/appointment\\/session-token\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  // '/customer/wishlist' routes
  {
    path: new RegExp('^\\/customer\\/wishlist\\/remove\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  {
    path: new RegExp('^\\/customer\\/wishlist\\/add\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  // '/home/property' route
  {
    path: new RegExp('^\\/home\\/property\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  // '/property' routes
  {
    path: new RegExp('^\\/property\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/property\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\\/carbon-footprint$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/property\\/offer\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/property\\/customer\\/offer\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'DELETE',
  },
  // '/role' routes
  {
    path: new RegExp('^\\/role\\/([0-9]+)$'),
    method: 'GET',
  },
  {
    path: new RegExp('^\\/role\\/([0-9]+)$'),
    method: 'DELETE',
  },
  // '/user' routes
  {
    path: new RegExp('^\\/user\\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    method: 'GET',
  },
];

export const whitelistStrings = [
  // '/agent/alert' routes
  { path: '/agent/alert/list', method: 'GET' },
  { path: '/agent/alert/unread-count', method: 'GET' },
  { path: '/agent/alert/create', method: 'POST' },
  // '/agent/analytics' routes
  { path: '/agent/analytics/tokens', method: 'POST' },
  { path: '/agent/analytics/property-offers', method: 'POST' },
  { path: '/agent/analytics/property-visits', method: 'POST' },
  { path: '/agent/analytics/properties-sold-rented', method: 'POST' },
  { path: '/agent/analytics/properties-listed', method: 'POST' },
  { path: '/agent/analytics/property-carbon-footprint', method: 'POST' },
  { path: '/agent/analytics/appointment-carbon-footprint', method: 'POST' },
  // '/agent/appointment' routes
  { path: '/agent/appointment/list', method: 'GET' },
  { path: '/agent/appointment/create', method: 'POST' },
  { path: '/agent/appointment/status', method: 'PUT' },
  { path: '/agent/appointment/log', method: 'POST' },
  { path: '/agent/appointment/note', method: 'POST' },
  { path: '/agent/appointment/check-availability', method: 'POST' },
  // '/agent/availability' routes
  { path: '/agent/availability/list', method: 'GET' },
  { path: '/agent/availability/update', method: 'PUT' },
  { path: '/agent/availability/list-slots', method: 'GET' },
  // '/agent/branch' routes
  { path: '/agent/branch/list', method: 'GET' },
  { path: '/agent/branch/create', method: 'POST' },
  { path: '/agent/branch/update', method: 'PUT' },
  // '/agent/dashboard' route
  { path: '/agent/dashboard', method: 'POST' },
  // '/agent/reports' routes
  { path: '/agent/reports/users', method: 'POST' },
  { path: '/agent/reports/properties', method: 'POST' },
  { path: '/agent/reports/services', method: 'POST' },
  // '/agent/user' routes
  { path: '/agent/user/list', method: 'GET' },
  { path: '/agent/user/to-allocate', method: 'GET' },
  { path: '/agent/user/create', method: 'POST' },
  { path: '/agent/user/update', method: 'PUT' },
  { path: '/agent/user/update-branch', method: 'PUT' },
  { path: '/agent/user/update-sorting', method: 'PUT' },
  // '/auth' routes
  { path: '/auth/login', method: 'POST' },
  { path: '/auth/agent-onboarding', method: 'POST' },
  { path: '/auth/customer-onboarding', method: 'POST' },
  { path: '/auth/register-agent', method: 'POST' },
  { path: '/auth/register-customer', method: 'POST' },
  { path: '/auth/forgot-password', method: 'GET' },
  { path: '/auth/reset-password', method: 'POST' },
  { path: '/auth/send-otp', method: 'POST' },
  { path: '/auth/check-field-exist', method: 'GET' },
  { path: '/auth/fetch-token-price', method: 'GET' },
  // '/category' route
  { path: '/category/list', method: 'GET' },
  // '/customer/alert' routes
  { path: '/customer/alert/list', method: 'GET' },
  { path: '/customer/alert/unread-count', method: 'GET' },
  { path: '/customer/alert/create', method: 'POST' },
  // '/customer/appointment' routes
  { path: '/customer/appointment/list', method: 'GET' },
  { path: '/customer/appointment/create', method: 'POST' },
  { path: '/customer/appointment/check-availability', method: 'POST' },
  // '/customer/dashboard' route
  { path: '/customer/dashboard', method: 'POST' },
  // '/customer/wishlist' route
  { path: '/customer/wishlist/list', method: 'GET' },
  // '/feature' route
  { path: '/feature/list', method: 'GET' },
  // '/home/property' routes
  { path: '/home/property/list', method: 'POST' },
  { path: '/home/property/search-polygon', method: 'POST' },
  { path: '/home/property/search-circle', method: 'POST' },
  { path: '/home/property/chat-attachment', method: 'PUT' },
  // '/property' routes
  { path: '/property/list', method: 'GET' },
  { path: '/property/to-allocate', method: 'GET' },
  { path: '/property/to-allocate-customer', method: 'GET' },
  { path: '/property/list-removal-reasons', method: 'GET' },
  { path: '/property/create', method: 'POST' },
  { path: '/property/update', method: 'PUT' },
  { path: '/property/document', method: 'POST' },
  { path: '/property/document', method: 'DELETE' },
  { path: '/property/image', method: 'POST' },
  { path: '/property/image', method: 'DELETE' },
  { path: '/property/featured-image', method: 'POST' },
  { path: '/property/virtual-tour', method: 'POST' },
  { path: '/property/removal-request', method: 'POST' },
  { path: '/property/qrcode', method: 'POST' },
  { path: '/property/allocated', method: 'DELETE' },
  { path: '/property/customer/make-offer', method: 'POST' },
  { path: '/property/agent/update-offer', method: 'POST' },
  { path: '/property/agent/enable-snaglist', method: 'POST' },
  { path: '/property/agent/check-snaglist', method: 'POST' },
  { path: '/property/customer/snag-list', method: 'POST' },
  { path: '/property/agent/snag-list', method: 'POST' },
  { path: '/property/log', method: 'POST' },
  // '/role' routes
  { path: '/role/list', method: 'GET' },
  { path: '/role/create', method: 'POST' },
  { path: '/role/update', method: 'PUT' },
  // '/user' routes
  { path: '/user/profile', method: 'GET' },
  { path: '/user/profile', method: 'PUT' },
  { path: '/user/update-password', method: 'PUT' },
  { path: '/user/update-timezone', method: 'PUT' },
  { path: '/user/list-customer', method: 'GET' },
  { path: '/user/validate-otp', method: 'POST' },
  { path: '/user/call-background-image', method: 'POST' },
  { path: '/user/call-background-image', method: 'DELETE' },
  { path: '/user/verify-password', method: 'POST' },
  { path: '/user/delete', method: 'DELETE' },
];
