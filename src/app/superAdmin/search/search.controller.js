import * as analyticsService from './search.service';

export const searchAll = async (req, res) => {
    try {
        const searchResults = await analyticsService.searchAll(req, res);
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const searchAppointments = async (req, res) => {
    try {
        const searchResults = await analyticsService.searchAppointments(req, res);
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const searchProperties = async (req, res) => {
    try {
        const searchResults = await analyticsService.searchProperties(req, res);
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const searchResults = await analyticsService.searchUsers(req, res);
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
