import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import * as homeController from './home.controller';
import swaggerDocument from '../../../swagger.json';

const router = Router();

router.get('/', homeController.index);
router.get('/health', homeController.healthCheck);

router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerDocument));

router.post('/book-demo', homeController.bookDemo);
router.post('/contact-us', homeController.contactUs);

export default router;
