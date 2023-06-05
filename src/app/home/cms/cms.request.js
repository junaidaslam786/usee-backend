import { body } from 'express-validator';
import db from '@/database';

export const createCommunityRules = [
    body('categoryId').exists().withMessage('Please provide categoryId').notEmpty().withMessage('Please provide categoryId'),
    body('title').exists().withMessage('Please provide title').notEmpty().withMessage('Please provide title')
];

export const createCommunityPostRules = [
    body('communityId').exists().custom(async (value) => {
        return await db.models.cmsCommunity.findOne({ where: { id: value } }).then(postData => {
            if (!postData) {
                return Promise.reject('Invalid community id or community do not exist.');
            }
        });
    }),
    body('title').exists().withMessage('Please provide title').notEmpty().withMessage('Please provide title'),
    body('name').exists().withMessage('Please provide name').notEmpty().withMessage('Please provide name'),
    body('email').isEmail().withMessage('Please provide valid email address').exists().withMessage('Please provide email address')
];

export const createCommunityPostCommentRules = [
    body('communityPostId').exists().custom(async (value) => {
        return await db.models.cmsCommunityPost.findOne({ where: { id: value } }).then(postData => {
            if (!postData) {
                return Promise.reject('Invalid post id or post do not exist.');
            }
        });
    }), 
    body('name').exists().withMessage('Please provide name').notEmpty().withMessage('Please provide name'),
    body('email').isEmail().withMessage('Please provide valid email address').exists().withMessage('Please provide email address'),
    body('comment').exists().withMessage('Please provide comment').notEmpty().withMessage('Please provide comment')
];