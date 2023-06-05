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
export const allCommunity = async (req, res, next) => {
  try {
    const result = await cmsService.allCommunity(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('allCommunityError', err);
    return next(err);
  }
};

/**
 * GET /cms/community/:id
 * single community
 */
 export const singleCommunity = async (req, res, next) => {

  try {
    const result = await cmsService.singleCommunity(req.params.id, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('singleCommunityError', err);
    return next(err);
  }
};

/**
 * GET /cms/community/post/:id
 * single community post
 */
 export const singleCommunityPost = async (req, res, next) => {

  try {
    const result = await cmsService.singleCommunityPost(req.params.id, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('singleCommunityPostError', err);
    return next(err);
  }
};

/**
 * POST /cms/community/create
 * Create community
 */
 export const createCommunity = async (req, res, next) => {

  try {
    const result = await cmsService.createCommunity(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('createCommunityError', err);
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