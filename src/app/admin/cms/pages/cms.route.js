import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as cmsController from './cms.controller';

const router = Router();

router.post('/all-pages', cmsController.allCmsPages);
router.put('/update-page', isAuthenticated, cmsController.updateCmsPage);
router.post('/add-page', isAuthenticated, cmsController.addCmsPage);
router.post('/upload-image', cmsController.addCmsPageImg);
router.post('/page', cmsController.getCmsPageById);
router.delete('/page/:id', cmsController.deleteCmsPageById);

router.post('/all-community-pages', cmsController.allCmsCommunityPages);
router.put('/community-page', cmsController.allCmsCommunityPages);

export default router;
