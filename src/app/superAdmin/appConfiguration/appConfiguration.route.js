import { Router } from 'express';
import * as AppConfigurationController from './appConfiguration.controller';

const router = Router();

router.get('/list-all', AppConfigurationController.getAllConfigs);
router.get('/:configKey', AppConfigurationController.getConfigByKey);
router.post('/create', AppConfigurationController.createConfig);
router.put('/:configKey', AppConfigurationController.updateConfig);
router.delete('/:configKey', AppConfigurationController.deleteConfig);

export default router;
