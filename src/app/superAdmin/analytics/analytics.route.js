import { Router } from 'express';
import { isAuthenticated, validate } from '@/middleware';
import * as analyticsController from './analytics.controller';

const router = Router();

// SERVICES
// User analytics
router.get('/users', isAuthenticated, analyticsController.getUsersAnalytics);
router.get('/active-users', isAuthenticated, analyticsController.getActiveUsersAnalytics);
router.get('/non-active-users', isAuthenticated, analyticsController.getNonActiveUsersAnalytics);
// Customer analytics
router.get('/customers', isAuthenticated, analyticsController.getCustomersAnalytics);
router.get('/active-customers', isAuthenticated, analyticsController.getActiveCustomersAnalytics);
// Agent analytics
router.get('/agents', isAuthenticated, analyticsController.getAgentsAnalytics);
router.get('/active-agents', isAuthenticated, analyticsController.getActiveAgentsAnalytics);
// // Developer analytics
// router.get('/developers', isAuthenticated, analyticsController.getDevelopersAnalytics);
// // Real estate analytics
// router.get('/real-estates', isAuthenticated, analyticsController.getRealEstatesAnalytics);
// // Freelancer analytics
// router.get('/freelancers', isAuthenticated, analyticsController.getFreelancersAnalytics);

// Subscription analytics
router.get('/subscriptions', isAuthenticated, analyticsController.getSubscriptionsAnalytics);
// Token analytics
router.get('/tokens', isAuthenticated, analyticsController.getTokensAnalytics);
// Feature analytics
router.get('/features', isAuthenticated, analyticsController.getFeaturesAnalytics);
// Subscription Features analytics
router.get('/subscription-features', isAuthenticated, analyticsController.getSubscriptionFeaturesAnalytics);
// Token Transaction analytics
router.get('/token-transactions', isAuthenticated, analyticsController.getTokenTransactionsAnalytics);

// 1. Visits per property
router.get('/property-visits', isAuthenticated, analyticsController.getPropertyVisits);
// 2. Duration of usee360 calls
router.get('/call-duration', isAuthenticated, analyticsController.getCallDuration);
// 3. Agents not responding to calls
router.get('/unresponsive-agents', isAuthenticated, analyticsController.getUnresponsiveAgents);
// 4. Number of usee360 requests sent
router.get('/requests-sent', isAuthenticated, analyticsController.getRequestsSent);

// 5. Number and status of offers on property list
router.get('/property-offers', isAuthenticated, analyticsController.getPropertyOffers); // DONE

// 6. Carbon footprint savings per usee360 call
router.get('/carbon-footprint', isAuthenticated, analyticsController.getCarbonFootprint);

// 7. Number of properties sold or rented each month
router.get('/properties-sold-rented', isAuthenticated, analyticsController.getPropertiesSoldRented);

// 8. Number of properties listed per developer/real estate/freelancer/owner
router.get('/properties-listed', isAuthenticated, analyticsController.getPropertiesListed);

// 9. Number and details of agents for each registered company
router.get('/agent-details', isAuthenticated, analyticsController.getAgentDetails);

export default router;
