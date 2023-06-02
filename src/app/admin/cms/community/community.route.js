import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as cmsController from './community.controller';

const router = Router();

router.put('/update-post', isAuthenticated, cmsController.updateCommunityPost);
router.put('/update-status', isAuthenticated, cmsController.updatePageStatus);
router.post('/add-post', isAuthenticated, cmsController.addCommunityPost);
router.get('/post/:id', isAuthenticated, cmsController.getCommunityPostById);
router.delete('/post/:id', isAuthenticated, cmsController.deleteCommunityPostById);
router.delete('/post-reply/:id', isAuthenticated, cmsController.deletePostReplyById);

router.post('/all-community-posts', isAuthenticated, cmsController.allCmsCommunityPosts);
router.post('/categories-list', isAuthenticated, cmsController.allCmsCategories);
router.post('/sub-categories-list', isAuthenticated, cmsController.allCmsSubCategories);

export default router;