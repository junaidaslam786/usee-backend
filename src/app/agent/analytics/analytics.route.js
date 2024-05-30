import { Router } from 'express';
import { isAuthenticated } from '@/middleware';
import * as analyticsController from './analytics.controller';

const router = Router();

// SERVICES
// User analytics
router.post('/users', isAuthenticated, analyticsController.getUsersAnalytics);
router.post('/active-users', isAuthenticated, analyticsController.getActiveUsersAnalytics);
router.post('/non-active-users', isAuthenticated, analyticsController.getNonActiveUsersAnalytics);
// Customer analytics
router.post('/customers', isAuthenticated, analyticsController.getCustomersAnalytics);
router.post('/active-customers', isAuthenticated, analyticsController.getActiveCustomersAnalytics);
// Agent analytics
router.post('/agents', isAuthenticated, analyticsController.getAgentsAnalytics);
router.post('/active-agents', isAuthenticated, analyticsController.getActiveAgentsAnalytics);
// // Developer analytics
// router.post('/developers', isAuthenticated, analyticsController.getDevelopersAnalytics);
// // Real estate analytics
// router.post('/real-estates', isAuthenticated, analyticsController.getRealEstatesAnalytics);
// // Freelancer analytics
// router.post('/freelancers', isAuthenticated, analyticsController.getFreelancersAnalytics);

// Subscription analytics
router.post('/subscriptions', isAuthenticated, analyticsController.getSubscriptionsAnalytics);
// Token analytics
router.post('/tokens', isAuthenticated, analyticsController.getTokensAnalytics);
// Feature analytics
router.post('/features', isAuthenticated, analyticsController.getFeaturesAnalytics);
// Subscription Features analytics
router.post('/subscription-features', isAuthenticated, analyticsController.getSubscriptionFeaturesAnalytics);
// Token Transaction analytics
router.post('/token-transactions', isAuthenticated, analyticsController.getTokenTransactionsAnalytics);

// 1. Visits per property
router.post('/property-visits', isAuthenticated, analyticsController.getPropertyVisits);
// 2. Duration of usee360 calls
router.post('/call-duration', isAuthenticated, analyticsController.getCallDuration);
// 3. Agents not responding to calls
router.post('/unresponsive-agents', isAuthenticated, analyticsController.getUnresponsiveAgents);
// 4. Number of usee360 requests sent
router.post('/requests-sent', isAuthenticated, analyticsController.getRequestsSent);

// 5. Number and status of offers on property list
router.post('/property-offers', isAuthenticated, analyticsController.getPropertyOffers); // DONE

// 6a. Carbon footprint savings per property
router.post('/property-carbon-footprint',
  isAuthenticated, analyticsController.getPropertyCarbonFootprintAnalytics);

// 6b. Carbon footprint savings per property
router.post('/appointment-carbon-footprint',
  isAuthenticated, analyticsController.getAppointmentCarbonFootprintAnalytics);

// 7. Number of properties sold or rented each month
router.post('/properties-sold-rented', isAuthenticated, analyticsController.getPropertiesSoldRented);

// 8. Number of properties listed per developer/real estate/freelancer/owner
router.post('/properties-listed', isAuthenticated, analyticsController.getPropertiesListed);

// 9. Number and details of agents for each registered company
router.post('/agent-details', isAuthenticated, analyticsController.getAgentDetails);

export default router;
