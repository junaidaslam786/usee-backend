import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";

const OP = Sequelize.Op;


export const getAllFeatures = async () => {
    try {
        console.log(db.models);
        return await featureModel.findAll();
    } catch (error) {
        console.error('Error in getAllFeatures:', error);
        throw error;
    }
};

export const getFeatureById = async (id) => {
    try {
        return await db.models.feature.findByPk(id);
    } catch (error) {
        console.error('Error in getFeatureById:', error);
        throw error;
    }
};

export const createFeature = async (featureData) => {
    try {
        return await db.models.feature.create(featureData);
    } catch (error) {
        console.error('Error in createFeature:', error);
        throw error;
    }
};

export const updateFeature = async (id, updateData) => {
    try {
        const feature = await db.models.feature.findByPk(id);
        if (!feature) return null;
        await feature.update(updateData);
        return feature;
    } catch (error) {
        console.error('Error in updateFeature:', error);
        throw error;
    }
};

export const deleteFeature = async (id) => {
    try {
        const feature = await db.models.feature.findByPk(id);
        if (!feature) return null;
        await feature.destroy();
        return true;
    } catch (error) {
        console.error('Error in deleteFeature:', error);
        throw error;
    }
};
