import createError from 'http-errors';
import * as pageService from './community.service';

/**
 * POST /admin/cms/community/add-post
 * Add page request
 */
export const addCommunityPost = async (req, res, next) => {
  try {
    const newPage = await pageService.addCommunityPost(req);
    if (newPage?.error && newPage?.message) {
      return next(createError(400, newPage.message));
    }

    res.status(200).json({message: 'Page added successfully', newPageId: newPage.id});
  } catch (err) {
    next(err);
  }
};


/**
 * POST /admin/cms/community/all-community-posts
 * List all cms community pages created by user
 */
export const allCmsCommunityPosts = async (req, res, next) => {

    try {
      const allPages = await pageService.allCmsCommunityPosts(req.dbInstance);
      if (allPages?.error && allPages?.message) {
          return next(createError(400, allPages.message));
      }
  
      return res.status(200).json(allPages);
    } catch (err) {
      console.log('allPagesError', err);
      return next(err);
    }
};

 /*
 * PUT /admin/cms/community/update-post
 * Update current cms community post
 */
export const updateCommunityPost = async (req, res, next) => {
    try {
      const updatePost = await pageService.updateCommunityPost(req);
      if (updatePost?.error && updatePost?.message) {
        return next(createError(400, updatePost.message));
      }
  
      return res.json({ success: true, message: "Page updated successfully", updatePost });
    } catch (err) {
      next(err);
    }
  };

   /*
 * GET /admin/cms/:id
 * Get community post By ID
 */
export const getCommunityPostById = async (req, res, next) => {
    try {
        const onePage = await pageService.getCommunityPostById(req.user, req.params);
        if (onePage?.error && onePage?.message) {
            return next(createError(400, onePage.message));
        }

        return res.status(200).json(onePage)
    } catch (err) {
        console.log('onePageError', err);
        next(err);
    }
};

/**
 * PUT /admin/cms/community
 * List all users created by agent
 */
export const updatePageStatus = async (req, res, next) => {
  try {
      const result = await pageService.updatePageStatus(req.user, req.body);
      if (result?.error && result?.message) {
          return next(createError(400, result.message));
      }

      return res.json({ success: true, message: "Status updated successfully" });
  } catch (err) {
      console.log('updatePageStatusError', err);
      next(err);
  }
};

/**
 * DELETE /admin/cms/community/post/:id
 * Delete community post by id
 */
export const deleteCommunityPostById = async (req, res, next) => {
    try {
        const deleteCommunityPost = await pageService.deleteCommunityPostById((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (deleteCommunityPost?.error && deleteCommunityPost?.message) {
            return next(createError(400, deleteCommunityPost.message));
        }

        return res.json({ success: true, message: "Page deleted successfully" });
    } catch (err) {
        console.log('deleteCommunityPostError', err);
        next(err);
    }
};

/**
 * DELETE /admin/cms/community/post-reply/:id
 * Delete community post reply by id
 */
export const deletePostReplyById = async (req, res, next) => {
    try {
        const deleteCommunityPost = await pageService.deletePostReplyById((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (deleteCommunityPost?.error && deleteCommunityPost?.message) {
            return next(createError(400, deleteCommunityPost.message));
        }

        return res.json({ success: true, message: "Reply deleted successfully" });
    } catch (err) {
        console.log('deletePostReplyError', err);
        next(err);
    }
};

/**
 * GET /admin/cms/categories-list
 * List all cms pages created by user
 */
export const allCmsCategories = async (req, res, next) => {

  try {
    const allCategories = await pageService.allCmsCategories(req.body, req.dbInstance);
    if (allCategories?.error && allCategories?.message) {
        return next(createError(400, allCategories.message));
    }

    return res.status(200).json(allCategories);
  } catch (err) {
    console.log('allCmsCategoriesError', err);
    return next(err);
  }
};
/**
 * GET /admin/cms/sub-categories-list
 * List all cms pages created by user
 */
export const allCmsSubCategories = async (req, res, next) => {

  try {
    const allCategories = await pageService.allCmsSubCategories(req.dbInstance);
    if (allCategories?.error && allCategories?.message) {
        return next(createError(400, allCategories.message));
    }

    return res.status(200).json(allCategories);
  } catch (err) {
    console.log('allCmsCategoriesError', err);
    return next(err);
  }
};