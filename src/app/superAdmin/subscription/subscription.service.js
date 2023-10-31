import db from '@/database';

export const listSubscriptionPlans = async (dbInstance) => {
  try {
    // Database call to list plans.
    const plans = await dbInstance.subscription.findAll();
    return plans;
  } catch (error) {
    console.error('Error in listSubscriptionPlans:', error);
    throw error;
  }
};

export const addSubscriptionPlan = async (dbInstance, data) => {
  try {
    // Database call to add a plan.
    const newPlan = await dbInstance.subscription.create(data);
    return newPlan;
  } catch (error) {
    console.error('Error in addSubscriptionPlan:', error);
    throw error;
  }
};

export const editSubscriptionPlan = async (dbInstance, id, planData) => {
  try {
    // Database call to update a plan.
    await dbInstance.subscription.update(planData, {
      where: {
        id,
      },
    });
    return planData;
  } catch (error) {
    console.error('Error in editSubscriptionPlan:', error);
    throw error;
  }
};

export const deleteSubscriptionPlan = async (dbInstance, id) => {
  try {
    // Database call to delete a plan.
    await dbInstance.subscription.destroy({
      where: {
        id,
      },
    });
  } catch (error) {
    console.error('Error in deleteSubscriptionPlan:', error);
    throw error;
  }
};

export const getSubscriptionPlanDetail = async (dbInstance, id) => {
  try {
    // Database call to get a single plan's detail.
    const plan = await dbInstance.subscription.findOne({
      where: {
        id,
      }
      // include: [db.feature],  // Assuming many-to-many relation with features.
    });
    return plan;
  } catch (error) {
    console.error('Error in getSubscriptionPlanDetail:', error);
    throw error;
  }
};

export const associateFeatures = async (dbInstance, planId, features) => {
  try {
    const plan = await dbInstance.subscription.findByPk(planId);
    console.log("PLAN: ", plan);
    const feature = await addFeatureToSubscription(plan.id, features);  // Assuming many-to-many relation with features.
    console.log("FEATURE: ", feature);
    return feature;
  } catch (error) {
    console.error('Error in associateFeatures:', error);
    throw error;
  }
};

async function addFeatureToSubscription(subscriptionId, featureIds) {
  const t = await dbInstance.sequelize.transaction();
  try {
    for (const featureId of featureIds) {
      await db.models.subscriptionFeature.create({
        subscriptionId: subscriptionId,
        featureId: featureId
      }, { transaction: t });
    }
    await t.commit();
    console.log('Features added to the subscription successfully.');
  } catch (error) {
    await t.rollback();
    console.error('Error adding features to the subscription:', error);
    throw error;
  }
}
