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
 * POST /cms/single-page/:id
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
 * POST /cms/all-posts
 * List all cms posts
 */
export const allPosts = async (req, res, next) => {

  try {
    const result = await cmsService.allPosts(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('allPostsError', err);
    return next(err);
  }
};

/**
 * POST /cms/single-post/:id
 * single post
 */
 export const singlePost = async (req, res, next) => {

  try {
    const result = await cmsService.singlePost(req.params.id, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('singlePostError', err);
    return next(err);
  }
};

/**
 * POST /cms/create-post
 * Create post
 */
 export const createPost = async (req, res, next) => {

  try {
    const result = await cmsService.createPost(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('createPostError', err);
    return next(err);
  }
};

/**
 * POST /cms/create-post-comment
 * Create comment
 */
 export const createComment = async (req, res, next) => {

  try {
    const result = await cmsService.createComment(req.body, req.dbInstance);
    if (result?.error && result?.message) {
      return next(createError(400, result.message));
    }
  
    return res.status(200).json(result);
  } catch (err) {
    console.log('createCommentError', err);
    return next(err);
  }
};