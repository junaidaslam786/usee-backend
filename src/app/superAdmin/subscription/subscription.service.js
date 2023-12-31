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

export const associateFeaturesToSubscription = async (dbInstance, planId, features) => {
  try {
    const plan = await dbInstance.subscription.findByPk(planId);
    if (!plan) return false;
    const feature = await addFeatureToSubscription(plan.id, features);  // Assuming many-to-many relation with features.
    console.log("FEATURE: ", feature);
    return feature;
  } catch (error) {
    console.error('Error in associateFeatures:', error);
    throw error;
  }
};

async function addFeatureToSubscription(subscriptionId, featureIds) {
  const t = await db.transaction();
  try {
    for (const featureId of featureIds) {
      // await db.models.subscriptionFeature.create({
      //   subscriptionId: subscriptionId,
      //   featureId: featureId
      // }, { transaction: t });
      await db.models.subscriptionFeature.findOrCreate({
        where: {
          subscriptionId: subscriptionId,
          featureId: featureId
        },
        defaults: {
          subscriptionId: subscriptionId,
          featureId: featureId
        },
        transaction: t
      });
    }
    await t.commit();
    console.log('Features added to the subscription successfully.');
    return true;
  } catch (error) {
    await t.rollback();
    console.error('Error adding features to the subscription:', error);
    throw error;
  }
}

export const listFeaturesBySubscription = async (dbInstance, subscriptionId, res) => {
  try {
    const features = await dbInstance.subscriptionFeature.findAll({
      where: {
        subscription_id: subscriptionId
      },
      include: [{
        model: dbInstance.feature,
        attributes: ['id', 'name', 'description', 'tokensPerUnit', 'totalUnits', 'freeUnits', 'unitName', 'unitType', 'featureType'],
      }],
    });

    const subscription = await dbInstance.subscription.findByPk(subscriptionId, { raw: true });
    
    const output = {
      subscription: {
        id: subscription.id,
        name: subscription.name,
        description: subscription.description
      },
      features: features.map(feature => ({
        id: feature.feature.id,
        name: feature.feature.name,
        description: feature.feature.description,
        tokensPerUnit: feature.feature.tokensPerUnit,
        totalUnits: feature.feature.totalUnits,
        freeUnits: feature.feature.freeUnits,
        unitName: feature.feature.unitName,
        unitType: feature.feature.unitType,
        featureType: feature.feature.featureType,
      })),
    };
    return output;
  } catch (error) {
    console.error('Error listing features by subscription:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

