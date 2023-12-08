import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();

// SERVICES
// User analytics
router.post('/users', analyticsController.getUsersAnalytics);
router.post('/active-users', analyticsController.getActiveUsersAnalytics);
router.post('/non-active-users', analyticsController.getNonActiveUsersAnalytics);
// Customer analytics
router.post('/customers', analyticsController.getCustomersAnalytics);
router.post('/active-customers', analyticsController.getActiveCustomersAnalytics);
// Agent analytics
router.post('/agents', analyticsController.getAgentsAnalytics);
router.post('/active-agents', analyticsController.getActiveAgentsAnalytics);
// // Developer analytics
// router.post('/developers', analyticsController.getDevelopersAnalytics);
// // Real estate analytics
// router.post('/real-estates', analyticsController.getRealEstatesAnalytics);
// // Freelancer analytics
// router.post('/freelancers', analyticsController.getFreelancersAnalytics);


// Subscription analytics
router.post('/subscriptions', analyticsController.getSubscriptionsAnalytics);
// Token analytics
router.post('/tokens', analyticsController.getTokensAnalytics);
// Feature analytics
router.post('/features', analyticsController.getFeaturesAnalytics);
// Subscription Features analytics
router.post('/subscription-features', analyticsController.getSubscriptionFeaturesAnalytics);
// Token Transaction analytics
router.post('/token-transactions', analyticsController.getTokenTransactionsAnalytics);

// 1. Visits per property
router.post('/property-visits', analyticsController.getPropertyVisits);
// 2. Duration of usee360 calls
router.post('/call-duration', analyticsController.getCallDuration);
// 3. Agents not responding to calls
router.post('/unresponsive-agents', analyticsController.getUnresponsiveAgents);
// 4. Number of usee360 requests sent
router.post('/requests-sent', analyticsController.getRequestsSent);

// 5. Number and status of offers on property list
router.post('/property-offers', analyticsController.getPropertyOffers); // DONE

// 6. Carbon footprint savings per usee360 call
router.post('/carbon-footprint', analyticsController.getCarbonFootprint);

// 7. Number of properties sold or rented each month
router.post('/properties-sold-rented', analyticsController.getPropertiesSoldRented);

// 8. Number of properties listed per developer/real estate/freelancer/owner
router.post('/properties-listed', analyticsController.getPropertiesListed);

// 9. Number and details of agents for each registered company
router.post('/agent-details', analyticsController.getAgentDetails);

export default router;
