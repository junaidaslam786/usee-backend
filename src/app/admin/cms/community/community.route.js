import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as cmsController from './community.controller';

const router = Router();

router.put('/update-post', isAuthenticated, cmsController.updateCommunityPost);
router.post('/add-post', isAuthenticated, cmsController.addCommunityPost);
router.post('/post-by-id', cmsController.getCommunityPostById);
router.delete('/post/:id', cmsController.deleteCommunityPostById);
router.delete('/post-reply/:id', cmsController.deletePostReplyById);

router.post('/all-community-posts', cmsController.allCmsCommunityPosts);
router.post('/categories-list', cmsController.allCmsCategories);
router.post('/sub-categories-list', cmsController.allCmsSubCategories);

export default router;
