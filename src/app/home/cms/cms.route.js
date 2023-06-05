import { Router } from 'express';

import { validate } from '@/middleware';
import * as cmsController from './cms.controller';
import * as cmsValidations from './cms.request';

const router = Router();

router.post('/all-pages', cmsController.allPages);
router.get('/single-page/:id', cmsController.singlePage);
router.post('/community/list', cmsController.allCommunity);
router.get('/community/:id', cmsController.singleCommunity);
router.get('/community/post/:id', cmsController.singleCommunityPost);
router.post('/community/post/create', validate(cmsValidations.createCommunityPostRules), cmsController.createCommunityPost);
router.post('/community/post/create-comment', validate(cmsValidations.createCommunityPostCommentRules), cmsController.createCommunityPostComment);

export default router;
