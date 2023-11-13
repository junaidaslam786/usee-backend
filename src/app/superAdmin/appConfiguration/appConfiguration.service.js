import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";

export const getAllConfigs = async (req) => {
    try {
        return await req.dbInstance.appConfiguration.findAll();
    } catch (error) {
        throw new Error(`Fetching configurations failed: ${error.message}`);
    }
};

export const getConfigByKey = async (req, configKey) => {
    try {
        return await req.dbInstance.appConfiguration.findOne({ where: { configKey } });
    } catch (error) {
        throw new Error(`Fetching configuration by key failed: ${error.message}`);
    }
};

export const createConfig = async (req, data) => {
    try {
        return await req.dbInstance.appConfiguration.create(data);
    } catch (error) {
        throw new Error(`Creating configuration failed: ${error.message}`);
    }
};

export const updateConfig = async (req, configKey, data) => {
    try {
        await req.dbInstance.appConfiguration.update(data, {
            where: {
                configKey,
            },
        });
        const config = getConfigByKey(req, configKey);
        return config;
    } catch (error) {
        throw new Error(`Updating configuration failed: ${error.message}`);
    }
};

export const deleteConfig = async (configKey) => {
    try {
        await db.appConfig.destroy({
            where: {
                configKey,
            },
        });
    } catch (error) {
        throw new Error(`Deleting configuration failed: ${error.message}`);
    }
};
