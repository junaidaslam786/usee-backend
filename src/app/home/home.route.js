import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

import * as homeController from './home.controller';
import swaggerDocument from '../../../swagger.json';

const router = Router();

// Serve swagger.json from the project
router.get('/docs/swagger.json', (req, res) => {
  res.sendFile(path.join(__dirname, swaggerDocument));
});

// Serve custom swagger.html
router.get('/docs', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../swagger.html'));
});

router.get('/', homeController.index);
router.get('/health', homeController.healthCheck);

// router.use('/docs', swaggerUi.serve);
// router.get('/docs', swaggerUi.setup(swaggerDocument));

router.post('/book-demo', homeController.bookDemo);
router.post('/contact-us', homeController.contactUs);

export default router;
