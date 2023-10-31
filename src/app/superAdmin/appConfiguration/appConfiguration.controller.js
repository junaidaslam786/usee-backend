import * as AppConfigService from './appConfiguration.service';

export const getAllConfigs = async (req, res) => {
    try {
        const configs = await AppConfigService.getAllConfigs(req);
        res.json(configs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getConfigByKey = async (req, res) => {
    try {
        const config = await AppConfigService.getConfigByKey(req, req.params.configKey);
        if (!config) return res.status(404).json({ message: 'Configuration not found' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createConfig = async (req, res) => {
    try {
        const configNew = await AppConfigService.createConfig(req, req.body);
        res.status(201).json(configNew);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateConfig = async (req, res) => {
    try {
        const config = await AppConfigService.updateConfig(req, req.params.configKey, req.body);
        if (!config) return res.status(404).json({ message: 'Configuration not found' });
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteConfig = async (req, res) => {
    try {
        await AppConfigService.deleteConfig(req.params.configKey);
        res.json({ message: 'Configuration deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
