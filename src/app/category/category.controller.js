import createError from 'http-errors';
import * as categoryService from './category.service';

/**
 * GET /category/list
 * List all categories
 */
export const listCategories = async (req, res, next) => {
  try {
    const result = await categoryService.listCategories(req.dbInstance);
    if (result?.error && result?.message) {
        return next(createError(400, result.message));
    }

    return res.status(200).json(result);
  } catch (err) {
    console.log('listCategoriesError', err);
    return next(err);
  }
};

/**
 * GET /category/:id
 * Get category detail by id
 */
export const getCategory = async (req, res, next) => {
    try {
        const result = await categoryService.getCategory((req.params?.id ? req.params?.id : 0), req.dbInstance);
        if (result?.error && result?.message) {
            return next(createError(400, result.message));
        }

        res.status(200).json(result);
    } catch (err) {
        console.log('getCategoryError', err);
        next(err);
    }
};