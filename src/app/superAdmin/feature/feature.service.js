import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";

export const listAllFeatures = async (dbInstance) => {
  const features = await dbInstance.feature.findAll();
  return features;
};

export const addFeature = async (featureData) => {
  const newFeature = await db.feature.create(featureData);
  return newFeature;
};

export const editFeature = async (id, featureData) => {
  await db.feature.update(featureData, {
    where: {
      id,
    },
  });
  return featureData;
};

export const deleteFeature = async (id) => {
  await db.feature.destroy({
    where: {
      id,
    },
  });
};

export const associateFeatureWithPlan = async (featureId, planId) => {
  const feature = await db.feature.findByPk(featureId);
  await feature.addPlan(planId); // Assuming there's a many-to-many relation set up with plans.
};
