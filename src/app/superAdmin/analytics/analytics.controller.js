import * as analyticsService from './analytics.service';

export const getUsersAnalytics = async (req, res) => {
    try {
        const usersAnalytics = await analyticsService.getUsersAnalytics(req, res);
        res.json(usersAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getActiveUsersAnalytics = async (req, res) => {
    try {
        const activeUsersAnalytics = await analyticsService.getActiveUsersAnalytics(req, res);
        res.json(activeUsersAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getNonActiveUsersAnalytics = async (req, res) => {
    try {
        const nonActiveUsersAnalytics = await analyticsService.getNonActiveUsersAnalytics(req, res);
        res.json(nonActiveUsersAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getSubscriptionsAnalytics = async (req, res) => {
    try {
        const subscriptionsAnalytics = await analyticsService.getSubscriptionsAnalytics(req);
        res.json(subscriptionsAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getTokensAnalytics = async (req, res) => {
    try {
        const tokensAnalytics = await analyticsService.getTokensAnalytics(req, res);
        res.json(tokensAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getFeaturesAnalytics = async (req, res) => {
    try {
        const featuresAnalytics = await analyticsService.getFeaturesAnalytics(req, res);
        res.json(featuresAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getSubscriptionFeaturesAnalytics = async (req, res) => {
    try {
        const subscriptionFeaturesAnalytics = await analyticsService.getSubscriptionFeaturesAnalytics(req, res);
        res.json(subscriptionFeaturesAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getTokenTransactionsAnalytics = async (req, res) => {
    try {
        const tokenTransactionsAnalytics = await analyticsService.getTokenTransactionsAnalytics(req, res);
        res.json(tokenTransactionsAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Serverrrr error', error });
    }
};

export const getPropertyVisits = async (req, res) => {
    try {
        const propertyVisits = await analyticsService.getPropertyVisits(req, res);
        res.json(propertyVisits);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getCallDuration = async (req, res) => {
    try {
        const callDuration = await analyticsService.getCallDuration(req);
        res.json(callDuration);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getUnresponsiveAgents = async (req, res) => {
    try {
        const unresponsiveAgents = await analyticsService.getUnresponsiveAgents(req);
        res.json(unresponsiveAgents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getRequestsSent = async (req, res) => {
    try {
        const requestsSent = await analyticsService.getRequestsSent(req);
        res.json(requestsSent);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPropertyOffers = async (req, res) => {
    try {
        const propertyOffers = await analyticsService.getPropertyOffers(req, res);
        res.json(propertyOffers);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getCarbonFootprint = async (req, res) => {
    try {
        const carbonFootprint = await analyticsService.getCarbonFootprint(req);
        res.json(carbonFootprint);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPropertiesSoldRented = async (req, res) => {
    try {
        const propertiesSoldRented = await analyticsService.getPropertiesSoldRented(req);
        res.json(propertiesSoldRented);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPropertiesListed = async (req, res) => {
    try {
        const propertiesListed = await analyticsService.getPropertiesListed(req);
        res.json(propertiesListed);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAgentDetails = async (req, res) => {
    try {
        const agentDetails = await analyticsService.getAgentDetails(req);
        res.json(agentDetails);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};