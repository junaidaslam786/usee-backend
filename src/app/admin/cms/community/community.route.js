import { Router } from 'express';

import { isAuthenticated } from '@/middleware';
import * as cmsController from './community.controller';

const router = Router();

router.post('/add-community', isAuthenticated, cmsController.addCommunity);
router.put('/update-community', isAuthenticated, cmsController.updateCommunity);
router.put('/update-community-status', isAuthenticated, cmsController.updateCommunityStatus);
router.get('/:id', isAuthenticated, cmsController.getCommunityById);
router.delete('/:id', isAuthenticated, cmsController.deleteCommunityById);
router.post('/list-community', isAuthenticated, cmsController.listCmsCommunity);

router.put('/update-post', isAuthenticated, cmsController.updateCommunityPost);
router.put('/update-post-status', isAuthenticated, cmsController.updatePageStatus);
router.post('/add-post', isAuthenticated, cmsController.addCommunityPost);
router.get('/post/:id', isAuthenticated, cmsController.getCommunityPostById);
router.delete('/post/:id', isAuthenticated, cmsController.deleteCommunityPostById);
router.delete('/post-reply/:id', isAuthenticated, cmsController.deletePostReplyById);
router.get('/all-posts/:id', isAuthenticated, cmsController.allCmsCommunityPosts);
router.post('/categories-list', isAuthenticated, cmsController.allCmsCategories);
router.post('/sub-categories-list', isAuthenticated, cmsController.allCmsSubCategories);

export default router;