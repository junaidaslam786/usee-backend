import * as analyticsService from './reports.service';

export const getUsersData = async (req, res) => {
    try {
        const users = await analyticsService.getUsersData(req, res);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getPropertiesData = async (req, res) => {
    try {
        const properties = await analyticsService.getPropertiesData(req, res);
        res.status(200).json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getServicesData = async (req, res) => {
    try {
        const services = await analyticsService.getServicesData(req, res);
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
