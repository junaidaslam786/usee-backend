import createError from 'http-errors';
import * as cmsService from './cms.service';

/**
 * POST /cms/all-pages
 * List all cms pages
*/
export const allPages = async (req, res, next) => {
  try {
    const result = await cmsService.allPages(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('allPagesError', err);
    return next(err);
  }
};

/**
 * GET /cms/single-page/:id
 * single page
*/
export const singlePage = async (req, res, next) => {
  try {
    const result = await cmsService.singlePage(req.params.id, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('singlePageError', err);
    return next(err);
  }
};

/**
 * POST /cms/community/list
 * List all community
 */
export const listCommunities = async (req, res, next) => {
  try {
    const result = await cmsService.listCommunities(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('listCommunitiesError', err);
    return next(err);
  }
};

/**
 * GET /cms/community/post/list
 * List all posts by community
 */
 export const listCommunityPosts = async (req, res, next) => {
  try {
    const result = await cmsService.listCommunityPosts(req);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('listCommunityPostsError', err);
    return next(err);
  }
};

/**
 * GET /cms/community/post/:id
 * Get community post details
 */
export const getCommunityPostById = async (req, res, next) => {
  try {
    const result = await cmsService.getCommunityPostById(req.params.id, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('getCommunityPostByIdError', err);
    return next(err);
  }
};


/**
 * POST /cms/community/create-post
 * Create community post
*/
export const createCommunityPost = async (req, res, next) => {
  try {
    const result = await cmsService.createCommunityPost(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('createCommunityPostError', err);
    return next(err);
  }
};

/**
 * POST /cms/community/create-post-comment
 * Create community post comment
 */
export const createCommunityPostComment = async (req, res, next) => {
  try {
    const result = await cmsService.createCommunityPostComment(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('createCommunityPostCommentError', err);
    return next(err);
  }
};