export const listCategories = async (dbInstance) => {
    try {
        return await dbInstance.category.findAll({
            include: [
              {
                model: dbInstance.categoryField, 
              },
            ],
        });
    } catch(err) {
        console.log('listCategoriesServiceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

export const getCategory = async (categoryId, dbInstance) => {
    try {
        const category = await getCategoryDetailById(categoryId, dbInstance);
        if (!category) {
            return { error: true, message: 'Invalid category id or category do not exist.'}
        }

        return category;
    } catch(err) {
        console.log('getCategoryerviceError', err)
        return { error: true, message: 'Server not responding, please try again later.'}
    }
}

const getCategoryDetailById = async (categoryId, dbInstance) => {
    const category = await dbInstance.category.findOne({
        where: { id: categoryId },
        include: [
          {
            model: dbInstance.categoryField, 
          },
        ],
    });

    if (!category) {
        return false;
    }

    return category;
}