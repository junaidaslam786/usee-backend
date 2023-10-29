import { SUPERADMIN_PROFILE_PATHS, PROPERTY_ROOT_PATHS, USER_TYPE } from "@/config/constants";

import { utilsHelper } from "@/helpers";
import db from "@/database";
import { Sequelize } from "sequelize";

export const getAllConfigs = async (req) => {
    try {
        console.log(db);
        return await req.dbInstance.appConfiguration.findAll();
    } catch (error) {
        throw new Error(`Fetching configurations failed: ${error.message}`);
    }
};

export const getConfigByKey = async (configKey) => {
    try {
        return await db.appConfig.findOne({ where: { configKey } });
    } catch (error) {
        throw new Error(`Fetching configuration by key failed: ${error.message}`);
    }
};

export const createConfig = async (data) => {
    try {
        return await db.appConfig.create(data);
    } catch (error) {
        throw new Error(`Creating configuration failed: ${error.message}`);
    }
};

export const updateConfig = async (configKey, data) => {
    try {
        await db.appConfig.update(data, {
            where: {
                configKey,
            },
        });
        return data;
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
