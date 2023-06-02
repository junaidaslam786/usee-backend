import createError from 'http-errors';
import * as pageService from './cms.service';

/**
 * POST /admin/cms/add-page
 * Add page request
 */
export const addCmsPage = async (req, res, next) => {
  try {
    const newPage = await pageService.addCmsPage(req);
    if (newPage?.error && newPage?.message) {
      return next(createError(400, newPage.message));
    }

    res.status(200).json({message: 'Page added successfully', newPageId: newPage.id});
  } catch (err) {
    next(err);
  }
};

/**
 * POST /admin/cms/add-page-desc-img
 * Add page description images request
 */
export const addCmsPageImg = async (req, res, next) => {
  try {
    const descImg = await pageService.addCmsPageImg(req);
    if (descImg?.error && descImg?.message) {
      return next(createError(400, descImg.message));
    }

    res.status(200).json({descImg});
  } catch (err) {
    next(err);
  }
};

/**
 * GET /admin/cms/all-pages
 * List all cms pages created by user
 */
export const allCmsPages = async (req, res, next) => {

    try {
      const allPages = await pageService.allCmsPages(req.body, req.dbInstance);
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
 * PUT /page/update-status
 * List all users created by agent
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

 /*
 * PUT /admin/cms/update
 * Update current cms page
 */
export const updateCmsPage = async (req, res, next) => {
    try {
      const updatePage = await pageService.updateCmsPage(req);
      if (updatePage?.error && updatePage?.message) {
        return next(createError(400, updatePage.message));
      }
  
      return res.json({ success: true, message: "Page updated successfully" });
    } catch (err) {
      next(err);
    }
  };

   /*
 * GET /admin/cms/:id
 * Get page By ID
 */
export const getCmsPageById = async (req, res, next) => {
    try {
        const onePage = await pageService.getCmsPageById(req.params);
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
 * DELETE /admin/page/:id
 * Delete page by id
 */
export const deleteCmsPageById = async (req, res, next) => {
    try {
        const deletePage = await pageService.deleteCmsPageById((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (deletePage?.error && deletePage?.message) {
            return next(createError(400, deletePage.message));
        }

        return res.json({ success: true, message: "Page deleted successfully" });
    } catch (err) {
        console.log('deletePageError', err);
        next(err);
    }
};


/**
 * GET /admin/cms/all-pages
 * List all cms pages created by user
 */
export const allCmsCommunityPages = async (req, res, next) => {

  try {
    const allPages = await pageService.allCmsCommunityPages(req.body, req.dbInstance);
    if (allPages?.error && allPages?.message) {
        return next(createError(400, allPages.message));
    }

    return res.status(200).json(allPages);
  } catch (err) {
    console.log('allPagesError', err);
    return next(err);
  }
};