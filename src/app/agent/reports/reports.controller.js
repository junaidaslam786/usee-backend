import * as analyticsService from './reports.service';

export const getUsersData = async (req, res) => {
    try {
        const users = await analyticsService.getUsersData(req, res, req.user);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export const getPropertiesData = async (req, res) => {
    try {
        const properties = await analyticsService.getPropertiesData(req, res, req.user);
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export const getServicesData = async (req, res) => {
    try {
        const services = await analyticsService.getServicesData(req, res, req.user);
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ error: error });
    }
}
