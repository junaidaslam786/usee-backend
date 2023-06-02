import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as cmsController from './cms.controller';

const router = Router();

router.post('/all-pages', isAuthenticated, cmsController.allCmsPages);
router.put('/update-page', isAuthenticated, cmsController.updateCmsPage);
router.post('/add-page', isAuthenticated, cmsController.addCmsPage);
router.put('/update-status', isAuthenticated, cmsController.updatePageStatus);
router.post('/upload-image', isAuthenticated, cmsController.addCmsPageImg);
router.get('/page/:id', isAuthenticated, cmsController.getCmsPageById);
router.delete('/page/:id', isAuthenticated, cmsController.deleteCmsPageById);

router.post('/all-community-pages', isAuthenticated, cmsController.allCmsCommunityPages);
router.put('/community-page', isAuthenticated, cmsController.allCmsCommunityPages);

export default router;
