import { Router } from 'express';

import { validate } from '@/middleware';
import * as cmsController from './cms.controller';
import * as cmsValidations from './cms.request';

const router = Router();

router.post('/all-pages', cmsController.allPages);
router.get('/single-page/:id', cmsController.singlePage);
router.post('/all-posts', cmsController.allPosts);
router.get('/single-post/:id', cmsController.singlePost);
router.post('/create-post', validate(cmsValidations.createPostRules), cmsController.createPost);
router.post('/create-post-comment', validate(cmsValidations.createCommentRules), cmsController.createComment);

export default router;
