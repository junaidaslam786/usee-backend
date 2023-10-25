import * as subscriptionPlanService from './subscription.service';

export const listSubscriptionPlans = async (req, res) => {
  try {
    const plans = await subscriptionPlanService.listSubscriptionPlans();
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addSubscriptionPlan = async (req, res) => {
  try {
    const newPlan = await subscriptionPlanService.addSubscriptionPlan(req.body);
    res.json(newPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const editSubscriptionPlan = async (req, res) => {
  try {
    const editedPlan = await subscriptionPlanService.editSubscriptionPlan(req.params.id, req.body);
    res.json(editedPlan);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteSubscriptionPlan = async (req, res) => {
  try {
    await subscriptionPlanService.deleteSubscriptionPlan(req.params.id);
    res.json({ message: 'Deleted Successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const viewSubscriptionPlanDetail = async (req, res) => {
  try {
    const planDetail = await subscriptionPlanService.getSubscriptionPlanDetail(req.params.id);
    res.json(planDetail);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const associateFeaturesToPlan = async (req, res) => {
  try {
    await subscriptionPlanService.associateFeatures(req.params.id, req.body.features);
    res.json({ message: 'Features associated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
