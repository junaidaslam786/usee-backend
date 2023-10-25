import { Router } from 'express';
import * as subscriptionPlanController from './subscription.controller';
const router = Router();

router.get('/', subscriptionPlanController.listSubscriptionPlans);
router.post('/', subscriptionPlanController.addSubscriptionPlan);
router.put('/:id', subscriptionPlanController.editSubscriptionPlan);
router.delete('/:id', subscriptionPlanController.deleteSubscriptionPlan);
router.get('/:id', subscriptionPlanController.viewSubscriptionPlanDetail);
router.post('/:id/features', subscriptionPlanController.associateFeaturesToPlan);

export default router;
