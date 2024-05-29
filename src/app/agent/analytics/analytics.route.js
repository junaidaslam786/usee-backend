import { Router } from 'express';
import { isAuthenticated, analyticsSubscription } from '@/middleware';
import * as analyticsController from './analytics.controller';

const router = Router();

// SERVICES
// User analytics
router.post('/users', isAuthenticated, analyticsSubscription, analyticsController.getUsersAnalytics);
router.post('/active-users', isAuthenticated, analyticsSubscription, analyticsController.getActiveUsersAnalytics);
router.post('/non-active-users', isAuthenticated,
  analyticsSubscription, analyticsController.getNonActiveUsersAnalytics);
// Customer analytics
router.post('/customers', isAuthenticated, analyticsSubscription, analyticsController.getCustomersAnalytics);
router.post('/active-customers', isAuthenticated,
  analyticsSubscription, analyticsController.getActiveCustomersAnalytics);
// Agent analytics
router.post('/agents', isAuthenticated, analyticsSubscription, analyticsController.getAgentsAnalytics);
router.post('/active-agents', isAuthenticated, analyticsSubscription, analyticsController.getActiveAgentsAnalytics);
// // Developer analytics
// router.post('/developers', isAuthenticated, analyticsSubscription, analyticsController.getDevelopersAnalytics);
// // Real estate analytics
// router.post('/real-estates', isAuthenticated, analyticsSubscription, analyticsController.getRealEstatesAnalytics);
// // Freelancer analytics
// router.post('/freelancers', isAuthenticated, analyticsSubscription, analyticsController.getFreelancersAnalytics);

// Subscription analytics
router.post('/subscriptions', isAuthenticated, analyticsSubscription, analyticsController.getSubscriptionsAnalytics);
// Token analytics
router.post('/tokens', isAuthenticated, analyticsSubscription, analyticsController.getTokensAnalytics);
// Feature analytics
router.post('/features', isAuthenticated, analyticsSubscription, analyticsController.getFeaturesAnalytics);
// Subscription Features analytics
router.post('/subscription-features', isAuthenticated,
  analyticsSubscription, analyticsController.getSubscriptionFeaturesAnalytics);
// Token Transaction analytics
router.post('/token-transactions', isAuthenticated,
  analyticsSubscription, analyticsController.getTokenTransactionsAnalytics);

// 1. Visits per property
router.post('/property-visits', isAuthenticated, analyticsSubscription, analyticsController.getPropertyVisits);
// 2. Duration of usee360 calls
router.post('/call-duration', isAuthenticated, analyticsSubscription, analyticsController.getCallDuration);
// 3. Agents not responding to calls
router.post('/unresponsive-agents', isAuthenticated, analyticsSubscription, analyticsController.getUnresponsiveAgents);
// 4. Number of usee360 requests sent
router.post('/requests-sent', isAuthenticated, analyticsSubscription, analyticsController.getRequestsSent);

// 5. Number and status of offers on property list
router.post('/property-offers', isAuthenticated, analyticsSubscription, analyticsController.getPropertyOffers); // DONE

// 6a. Carbon footprint savings per property
router.post('/property-carbon-footprint',
  isAuthenticated, analyticsSubscription, analyticsController.getPropertyCarbonFootprintAnalytics);

// 6b. Carbon footprint savings per property
router.post('/appointment-carbon-footprint',
  isAuthenticated, analyticsSubscription, analyticsController.getAppointmentCarbonFootprintAnalytics);

// 7. Number of properties sold or rented each month
router.post('/properties-sold-rented', isAuthenticated,
  analyticsSubscription, analyticsController.getPropertiesSoldRented);

// 8. Number of properties listed per developer/real estate/freelancer/owner
router.post('/properties-listed', isAuthenticated, analyticsSubscription, analyticsController.getPropertiesListed);

// 9. Number and details of agents for each registered company
router.post('/agent-details', isAuthenticated, analyticsSubscription, analyticsController.getAgentDetails);

export default router;
