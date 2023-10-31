import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";

export const listAllFeatures = async (req) => {
  const features = await req.dbInstance.feature.findAll();
  return features;
};

export const getFeatureById = async (req, featureId) => {
  try {
      return await req.dbInstance.feature.findOne({ where: { id: featureId } });
  } catch (error) {
      throw new Error(`Fetching configuration by key failed: ${error.message}`);
  }
};

export const addFeature = async (dbInstance, featureData) => {
  const newFeature = await dbInstance.feature.create(featureData);
  return newFeature;
};

export const updateFeature = async (dbInstance, featureId, featureData) => {
  try {
    await dbInstance.feature.update(featureData, {
      where: {
        id: featureId,
      },
    });
    return featureData;
  } catch (error) {
    throw new Error(`Updating feature failed: ${error.message}`);
  }
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
  await db.models.feature.destroy({
    where: {
      id,
    },
  });
};

export const associateFeatureWithPlan = async (featureId, planId) => {
  const feature = await db.feature.findByPk(featureId);
  await feature.addPlan(planId); // Assuming there's a many-to-many relation set up with plans.
};
