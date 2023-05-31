import { CMS_STATUS, PRODUCT_CATEGORIES } from "@/config/constants";
import { Sequelize } from 'sequelize';
const Op = Sequelize.Op;

export const allPages = async (reqBody, dbInstance) => {
  
  let whereClause = {}
  whereClause.status = CMS_STATUS.PUBLISHED
  if(reqBody?.pageType) {
    whereClause.pageType = reqBody.pageType
  }

  if(reqBody?.keyword) {
    whereClause.title = {
      [Op.iLike]: '%' + reqBody.keyword + '%'
    }
  }

  try {
    const { rows } = await dbInstance.cmsPage.findAndCountAll({
      where: whereClause,
      include: [{
        model: dbInstance.cmsPageCategoryField, 
        attributes: ["value"],
        include: [
          {
            model: dbInstance.categoryField, 
            attributes: ["id", "label", "type", "options", "required"]
          },
        ],
      }, {
        model: dbInstance.cmsAsset,
      }],
      order: [['id', 'DESC']]
    });

    let arr = [];
    rows.map((el) => {
      if(reqBody?.propertyType) {
        const index = el.cmsPageCategoryFields.findIndex(category => category.categoryField.id === 1)
        if(index === -1 || el.cmsPageCategoryFields[index].value !== reqBody.propertyType) {
          return
        }
      }
      if(reqBody?.propertySubType) {
        const id = (reqBody.propertySubType === "commercial") ? 7 : 6
        const index = el.cmsPageCategoryFields.findIndex(category => category.categoryField.id === id)
        if(index === -1 || el.cmsPageCategoryFields[index].value !== reqBody.propertySubType) {
          return
        }
      }
      if(reqBody?.propertyCategoryType) {
        const index = el.cmsPageCategoryFields.findIndex(category => category.categoryField.id === 2)
        if(index === -1 || el.cmsPageCategoryFields[index].value !== reqBody.propertyCategoryType) {
          return
        }
      }
      arr.push(el)
    });

    const page = (reqBody && reqBody.page) ? reqBody.page : 1
    const perPage = (reqBody && reqBody.size) ? reqBody.size : 10
    const offset = (page - 1) * perPage

    const paginatedArr = arr.slice(offset).slice(0, perPage)
    const totalPages = Math.ceil(arr.length / perPage)

    return {
      data: paginatedArr,
      page: page,
      size: perPage,
      totalPage: totalPages,
      totalItems: arr.length,
    };
    
  } catch (err) {
    console.log('allPagesError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const singlePage = async (id, dbInstance) => {
  
  try {
    const page = await dbInstance.cmsPage.findOne({ where: { id: id } });
    return page; 
  } catch (err) {
    console.log('singlePageError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const allPosts = async (reqBody, dbInstance) => {
  
  let whereClause = {}
  whereClause.status = CMS_STATUS.PUBLISHED
  if(reqBody?.keyword) {
    whereClause.title = {
      [Op.iLike]: '%' + reqBody.keyword + '%'
    }
  }

  try {
    const { rows } = await dbInstance.cmsCommunityPost.findAndCountAll({
      where: whereClause,
      include: [{
        model: dbInstance.cmsCommunityCategoryField,
        attributes: ["value"],
        include: [{
          model: dbInstance.categoryField, 
          attributes: ["id", "label", "type", "options", "required"],
        },
      ],
      }, {
        model: dbInstance.cmsCommunityPostComment,
      }],
      order: [['id', 'DESC']]
    });

    let arr = [];
    rows.map((el) => {
      if(reqBody?.propertyType) {
        const index = el.cmsCommunityCategoryFields.findIndex(category => category.categoryField.id === 1)
        if(index === -1 || el.cmsCommunityCategoryFields[index].value !== reqBody.propertyType) {
          return
        }
      }
      if(reqBody?.propertySubType) {
        const id = (reqBody.propertySubType === "commercial") ? 7 : 6
        const index = el.cmsCommunityCategoryFields.findIndex(category => category.categoryField.id === id)
        if(index === -1 || el.cmsCommunityCategoryFields[index].value !== reqBody.propertySubType) {
          return
        }
      }
      if(reqBody?.propertyCategoryType) {
        const index = el.cmsCommunityCategoryFields.findIndex(category => category.categoryField.id === 2)
        if(index === -1 || el.cmsCommunityCategoryFields[index].value !== reqBody.propertyCategoryType) {
          return
        }
      }
      arr.push(el)
    });

    const page = (reqBody && reqBody.page) ? reqBody.page : 1
    const perPage = (reqBody && reqBody.size) ? reqBody.size : 10
    const offset = (page - 1) * perPage

    const paginatedArr = arr.slice(offset).slice(0, perPage)
    const totalPages = Math.ceil(arr.length / perPage)

    return {
      data: paginatedArr,
      page: page,
      size: perPage,
      totalPage: totalPages,
      totalItems: arr.length,
    };
    
  } catch (err) {
    console.log('allPostsError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const singlePost = async (id, dbInstance) => {
  
  try {
    const page = await dbInstance.cmsCommunityPost.findOne({ 
      where: { 
        id: id
      },
      include: [{
        model: dbInstance.cmsCommunityCategoryField, 
        attributes: ["value"],
        include: [
          {
            model: dbInstance.categoryField, 
            attributes: ["id", "label", "type", "options", "required"]
          },
        ],
      }, {
        model: dbInstance.cmsCommunityPostComment,
      }]
    });

    return page; 
  } catch (err) {
    console.log('singlePostError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createPost = async (reqBody, dbInstance) => {
  const { 
    name,
    email,
    title,
    categoryId,
  } = reqBody;

  try {
    const post = await dbInstance.cmsCommunityPost.create({
      categoryId,
      title,
      name,
      email,
      status: CMS_STATUS.PUBLISHED
    });

    const metaTags = [];
    for (const [key, value] of Object.entries(reqBody)) {
      if (key.startsWith('metaTags')) {
        const index = Number(key.substring(key.length - 1))
        metaTags.push({
          communityPostId: post.id,
          key: index,
          value
        });
      }
    }
    
    await dbInstance.cmsCommunityCategoryField.bulkCreate(metaTags);
    
    return post;
  } catch (err) {
    console.log('createPostError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createComment = async (reqBody, dbInstance) => {
  
  const { communityPostId, name, email, comment } = reqBody;

  try {
    const postComment = await dbInstance.cmsCommunityPostComment.create({
      communityPostId,
      name,
      email,
      comment
    });
    
    return postComment;
  } catch (err) {
    console.log('createCommentError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
}