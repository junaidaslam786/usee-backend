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

export const getCustomersAnalytics = async (req, res) => {
    try {
        const customersAnalytics = await analyticsService.getCustomersAnalytics(req, res);
        res.json(customersAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getActiveCustomersAnalytics = async (req, res) => {
    try {
        const activeCustomersAnalytics = await analyticsService.getActiveCustomersAnalytics(req, res);
        res.json(activeCustomersAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getAgentsAnalytics = async (req, res) => {
    try {
        const agentsAnalytics = await analyticsService.getAgentsAnalytics(req, res);
        res.json(agentsAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getActiveAgentsAnalytics = async (req, res) => {
    try {
        const activeAgentsAnalytics = await analyticsService.getActiveAgentsAnalytics(req, res);
        res.json(activeAgentsAnalytics);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
}

export const getSubscriptionsAnalytics = async (req, res) => {
    try {
        const subscriptionsAnalytics = await analyticsService.getSubscriptionsAnalytics(req, res);
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
        const propertyVisits = await analyticsService.getPropertyVisitsAlt(req, res);
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
        const unresponsiveAgents = await analyticsService.getUnresponsiveAgents(req, res);
        res.json(unresponsiveAgents);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getRequestsSent = async (req, res) => {
    try {
        const requestsSent = await analyticsService.getRequestsSent(req, res);
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
        const carbonFootprint = await analyticsService.getCarbonFootprint(req, res);
        res.json(carbonFootprint);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPropertiesSoldRented = async (req, res) => {
    try {
        const propertiesSoldRented = await analyticsService.getPropertiesSoldRented(req, res);
        res.json(propertiesSoldRented);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getPropertiesListed = async (req, res) => {
    try {
        const propertiesListed = await analyticsService.getPropertiesListed(req, res);
        res.json(propertiesListed);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getAgentDetails = async (req, res) => {
    try {
        const agentDetails = await analyticsService.getAgentDetails(req, res);
        res.json(agentDetails);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};