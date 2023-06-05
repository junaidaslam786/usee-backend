import { CMS_STATUS } from "@/config/constants";
import { Sequelize } from 'sequelize';
const Op = Sequelize.Op;

export const allPages = async (reqBody, dbInstance) => {
  let whereClause = {}
  whereClause.status = CMS_STATUS.PUBLISHED;

  if (reqBody?.pageType) {
    whereClause.pageType = reqBody.pageType
  }

  if (reqBody?.keyword) {
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
      order: [['createdAt', 'DESC']]
    });

    let arr = [];
    rows.map((el) => {
      if (reqBody?.propertyType) {
        const index = el.cmsPageCategoryFields.findIndex(category => category.categoryField.id === 1)
        if(index === -1 || el.cmsPageCategoryFields[index].value !== reqBody.propertyType) {
          return
        }
      }

      if (reqBody?.propertySubType) {
        const id = (reqBody.propertySubType === "commercial") ? 7 : 6
        const index = el.cmsPageCategoryFields.findIndex(category => category.categoryField.id === id)
        if (index === -1 || el.cmsPageCategoryFields[index].value !== reqBody.propertySubType) {
          return
        }
      }

      if (reqBody?.propertyCategoryType) {
        const index = el.cmsPageCategoryFields.findIndex(category => category.categoryField.id === 2)
        if (index === -1 || el.cmsPageCategoryFields[index].value !== reqBody.propertyCategoryType) {
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

export const allCommunity = async (reqBody, dbInstance) => {
  let whereClause = {}
  whereClause.status = CMS_STATUS.PUBLISHED

  if (reqBody?.keyword) {
    whereClause.title = {
      [Op.iLike]: '%' + reqBody.keyword + '%'
    }
  }

  try {
    const { rows } = await dbInstance.cmsCommunity.findAndCountAll({
      where: whereClause,
      include: [{
        model: dbInstance.cmsCommunityCategoryField,
        attributes: ["value"],
        include: [{
          model: dbInstance.categoryField, 
          attributes: ["id", "label", "type", "options", "required"],
        }],
      }],
      order: [['createdAt', 'DESC']]
    });

    let arr = [];
    rows.map((el) => {
      if (reqBody?.propertyType) {
        const index = el.cmsCommunityCategoryFields.findIndex(category => category.categoryField.id === 1)
        if (index === -1 || el.cmsCommunityCategoryFields[index].value !== reqBody.propertyType) {
          return
        }
      }

      if (reqBody?.propertySubType) {
        const id = (reqBody.propertySubType === "commercial") ? 7 : 6
        const index = el.cmsCommunityCategoryFields.findIndex(category => category.categoryField.id === id)
        if (index === -1 || el.cmsCommunityCategoryFields[index].value !== reqBody.propertySubType) {
          return
        }
      }

      if (reqBody?.propertyCategoryType) {
        const index = el.cmsCommunityCategoryFields.findIndex(category => category.categoryField.id === 2)
        if (index === -1 || el.cmsCommunityCategoryFields[index].value !== reqBody.propertyCategoryType) {
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
    console.log('allCommunityError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const singleCommunity = async (id, dbInstance) => {
  try {
    const community = await dbInstance.cmsCommunity.findOne({ 
      where: { id: id },
      include: [{
        model: dbInstance.cmsCommunityPost
      }]
    });

    return community;
  } catch (err) {
    console.log('singleCommunityError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const singleCommunityPost = async (id, dbInstance) => {
  try {
    const communityPost = await dbInstance.cmsCommunityPost.findOne({ 
      where: { id },
      include: [{
        model: dbInstance.cmsCommunityPostComment
      }]
    });

    return communityPost;
  } catch (err) {
    console.log('singleCommunityPostError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createCommunityPost = async (reqBody, dbInstance) => {
  const { 
    name,
    email,
    title,
    communityId,
  } = reqBody;

  try {
    const communityPost = await dbInstance.cmsCommunityPost.create({
      communityId,
      title,
      name,
      email,
      status: CMS_STATUS.PUBLISHED
    });
    
    return communityPost;
  } catch (err) {
    console.log('createCommunityPostError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const createCommunityPostComment = async (reqBody, dbInstance) => {
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
    console.log('createCommunityPostCommentError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
}