import createError from 'http-errors';
import * as pageService from './community.service';

/**
 * POST /admin/cms/community/add-community
 * Add new community
 */
export const addCommunity = async (req, res, next) => {
  try {
    const newPage = await pageService.addCommunity(req);
    if (newPage?.error && newPage?.message) {
      return next(createError(400, newPage.message));
    }

    res.status(200).json({message: 'Community added successfully.', newPageId: newPage.id});
  } catch (err) {
    next(err);
  }
};

/*
 * GET /admin/cms/community/:id
 * Get community details by id
 */
export const getCommunityById = async (req, res, next) => {
  try {
      const onePage = await pageService.getCommunityById(req.params?.id);
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
* Update community status
*/
export const updateCommunityStatus = async (req, res, next) => {
try {
    const result = await pageService.updateCommunityStatus(req.body);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.json({ success: true, message: "Status updated successfully" });
} catch (err) {
    console.log('updateCommunityStatusError', err);
    next(err);
}
};

/**
* DELETE /admin/cms/community/:id
* Delete community by id
*/
export const deleteCommunityById = async (req, res, next) => {
  try {
    const deleteCommunityPost = await pageService.deleteCommunityById((req.params?.id ? req.params?.id : 0), req.dbInstance);
    if (deleteCommunityPost?.error && deleteCommunityPost?.message) {
        return next(createError(400, deleteCommunityPost.message));
    }

    return res.json({ success: true, message: "Community deleted successfully" });
  } catch (err) {
    console.log('deleteCommunityByIdError', err);
    next(err);
  }
};

 /*
 * PUT /admin/cms/community/update-community
 * Update current cms community
 */
 export const updateCommunity = async (req, res, next) => {
  try {
    const updatePost = await pageService.updateCommunity(req);
    if (updatePost?.error && updatePost?.message) {
      return next(createError(400, updatePost.message));
    }

    return res.json({ success: true, message: "Community updated successfully", updatePost });
  } catch (err) {
    next(err);
  }
};

/* POST /admin/cms/community/list-community
* List all cms communities created by user
*/
export const listCmsCommunity = async (req, res, next) => {

   try {
     const allPages = await pageService.listCmsCommunity(req.dbInstance);
     if (allPages?.error && allPages?.message) {
         return next(createError(400, allPages.message));
     }
 
     return res.status(200).json(allPages);
   } catch (err) {
     console.log('allPagesError', err);
     return next(err);
   }
};


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

    res.status(200).json({message: 'Community post added successfully.', newPageId: newPage.id});
  } catch (err) {
    console.log('addCommunityPostError', err);
    next(err);
  }
};

/**
 * POST /admin/cms/community/all-community-posts
 * List all cms community pages created by user
 */
export const allCmsCommunityPosts = async (req, res, next) => {

    try {
      const allPages = await pageService.allCmsCommunityPosts(req.params?.id, req.dbInstance);
      if (allPages?.error && allPages?.message) {
          return next(createError(400, allPages.message));
      }
  
      return res.status(200).json(allPages);
    } catch (err) {
      console.log('allCmsCommunityPostsError', err);
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
  
      return res.json({ success: true, message: "Community post updated successfully.", updatePost });
    } catch (err) {
      console.log('updateCommunityPostError', err);
      next(err);
    }
  };

 /*
 * GET /admin/cms/community/:id
 * Get community post By ID
 */
export const getCommunityPostById = async (req, res, next) => {
    try {
        const onePage = await pageService.getCommunityPostById(req.params);
        if (onePage?.error && onePage?.message) {
            return next(createError(400, onePage.message));
        }

        return res.status(200).json(onePage)
    } catch (err) {
        console.log('getCommunityPostByIdError', err);
        next(err);
    }
};

/**
 * PUT /admin/cms/community/update-post-status
 * Update
 */
export const updatePageStatus = async (req, res, next) => {
  try {
      const result = await pageService.updatePageStatus(req.body);
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