import { Router } from 'express';
import * as analyticsController from './analytics.controller';

const router = Router();

// SERVICES
// User analytics
router.get('/users', analyticsController.getUsersAnalytics);
router.get('/active-users', analyticsController.getActiveUsersAnalytics);
router.get('/non-active-users', analyticsController.getNonActiveUsersAnalytics);
// Subscription analytics
router.get('/subscriptions', analyticsController.getSubscriptionsAnalytics);
// Token analytics
router.get('/tokens', analyticsController.getTokensAnalytics);
// Feature analytics
router.get('/features', analyticsController.getFeaturesAnalytics);
// Subscription Features analytics
router.get('/subscription-features', analyticsController.getSubscriptionFeaturesAnalytics);
// Token Transaction analytics
router.get('/token-transactions', analyticsController.getTokenTransactionsAnalytics);

// 1. Visits per property
router.get('/property-visits', analyticsController.getPropertyVisits);
// 2. Duration of usee360 calls
router.get('/call-duration', analyticsController.getCallDuration);
// 3. Agents not responding to calls
router.get('/unresponsive-agents', analyticsController.getUnresponsiveAgents);
// 4. Number of usee360 requests sent
router.get('/requests-sent', analyticsController.getRequestsSent);

// 5. Number and status of offers on property list
router.get('/property-offers', analyticsController.getPropertyOffers); // DONE

// 6. Carbon footprint savings per usee360 call
router.get('/carbon-footprint', analyticsController.getCarbonFootprint);

// 7. Number of properties sold or rented each month
router.get('/properties-sold-rented', analyticsController.getPropertiesSoldRented);

// 8. Number of properties listed per developer/real estate/freelancer/owner
router.get('/properties-listed', analyticsController.getPropertiesListed);

// 9. Number and details of agents for each registered company
router.get('/agent-details', analyticsController.getAgentDetails);

export default router;
