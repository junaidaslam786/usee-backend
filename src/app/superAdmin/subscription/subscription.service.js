import db from '@/database';

export const listSubscriptionPlans = async () => {
  // Database call to list plans.
  const plans = await db.subscriptionPlan.findAll();
  return plans;
};

export const addSubscriptionPlan = async (planData) => {
  // Database call to add a plan.
  const newPlan = await db.subscriptionPlan.create(planData);
  return newPlan;
};

export const editSubscriptionPlan = async (id, planData) => {
  // Database call to update a plan.
  await db.subscriptionPlan.update(planData, {
    where: {
      id,
    },
  });
  return planData;
};

export const deleteSubscriptionPlan = async (id) => {
  // Database call to delete a plan.
  await db.subscriptionPlan.destroy({
    where: {
      id,
    },
  });
};

export const getSubscriptionPlanDetail = async (id) => {
  // Database call to get a single plan's detail.
  const plan = await db.subscriptionPlan.findOne({
    where: {
      id,
    },
    include: [db.feature],  // Assuming many-to-many relation with features.
  });
  return plan;
};

export const associateFeatures = async (planId, features) => {
  const plan = await db.subscriptionPlan.findByPk(planId);
  await plan.addFeatures(features);  // Assuming many-to-many relation with features.
};
