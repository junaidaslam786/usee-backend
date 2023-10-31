import feature from '@/database/models/feature';
import * as subscriptionPlanService from './subscription.service';

export const listSubscriptionPlans = async (req, res) => {
  // try {
    const plans = await subscriptionPlanService.listSubscriptionPlans(req.dbInstance);
    res.json(plans);
  // } catch (error) {
  //   res.status(500).json({ message: 'Server Error' });
  // }
};

export const addSubscriptionPlan = async (req, res) => {
  try {
    const newPlan = await subscriptionPlanService.addSubscriptionPlan(req.dbInstance, req.body);
    res.json(newPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const editSubscriptionPlan = async (req, res) => {
  try {
    const editedPlan = await subscriptionPlanService.editSubscriptionPlan(req.dbInstance, req.params.id, req.body);
    res.json(editedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteSubscriptionPlan = async (req, res) => {
  try {
    await subscriptionPlanService.deleteSubscriptionPlan(req.dbInstance, req.params.id);
    res.json({ message: 'Deleted Successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const viewSubscriptionPlanDetail = async (req, res) => {
  try {    
    const planDetail = await subscriptionPlanService.getSubscriptionPlanDetail(req.dbInstance, req.params.id);
    if (!planDetail) return res.status(404).json({ message: 'Subscription not found' });
    res.json(planDetail);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const associateFeaturesToPlan = async (req, res) => {
  try {
    const feature = await subscriptionPlanService.associateFeatures(req.dbInstance, req.params.id, req.body.features);
    res.json({ message: 'Feature associated successfully', data: feature });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
