import { Router } from 'express';
import * as subscriptionPlanController from './subscription.controller';
const router = Router();

router.get('/list-all', subscriptionPlanController.listSubscriptionPlans);
router.post('/create', subscriptionPlanController.addSubscriptionPlan);
router.put('/:id', subscriptionPlanController.editSubscriptionPlan);
router.delete('/:id', subscriptionPlanController.deleteSubscriptionPlan);
router.get('/:id', subscriptionPlanController.listFeaturesBySubscription);
router.post('/:id/features', subscriptionPlanController.associateFeaturesToSubscription);

export default router;
