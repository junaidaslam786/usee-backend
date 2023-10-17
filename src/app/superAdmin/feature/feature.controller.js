import * as FeatureService from './feature.service';

export const getAllFeatures = async (req, res) => {
    try {
        const features = await FeatureService.getAllFeatures();
        res.json(features);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const getFeatureById = async (req, res) => {
    try {
        const feature = await FeatureService.getFeatureById(req.params.id);
        if (!feature) return res.status(404).json({ message: 'Feature not found' });
        res.json(feature);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const createFeature = async (req, res) => {
    try {
        const feature = await FeatureService.createFeature(req.body);
        res.status(201).json(feature);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateFeature = async (req, res) => {
    try {
        const feature = await FeatureService.updateFeature(req.params.id, req.body);
        if (!feature) return res.status(404).json({ message: 'Feature not found' });
        res.json(feature);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const deleteFeature = async (req, res) => {
    try {
        await FeatureService.deleteFeature(req.params.id);
        res.json({ message: 'Feature deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
