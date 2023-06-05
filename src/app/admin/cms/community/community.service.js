import db from "@/database";

export const addCommunity = async (req) => {
  try {
    const {
      title,
      categoryId,
      status,
      questionAskedBy,
      categoryField1,
      categoryField2
    } = req.body;

    // Create a Community Post
    const newCommunity = await db.models.cmsCommunity.create({
      title,
      categoryId,
      createdBy: questionAskedBy,
      status,
    });

    await db.models.cmsCommunityCategoryField.create({
      communityId: newCommunity.id,
      key: 1,
      value: categoryField1,
    });

    await db.models.cmsCommunityCategoryField.create({
      communityId: newCommunity.id,
      key: 2,
      value: categoryField2,
    });

    return newCommunity;
  } catch (err) {
    console.log("addCmsPageError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getCommunityById = async (id) => {
  try {
    const oneCommunity = await db.models.cmsCommunity.findOne({
      where: { id },
      include: [
        {
          model: db.models.cmsCommunityCategoryField,
        },
      ],
    });

    if (!oneCommunity) {
      return false;
    }

    return oneCommunity;
  } catch (err) {
    console.log("getCommunityServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deleteCommunityById = async (id, dbInstance) => {
  try {
    await dbInstance.cmsCommunity.destroy({
      where: {
        id,
      },
    });

    return true;
  } catch (err) {
    console.log("deleteCmsPageServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updateCommunity = async (req) => {
  try {
    const reqBody = req.body;
    const { id, title, categoryId, status, categoryField1, categoryField2, postUpdatedBy } =
      reqBody;

    const oldCommunity = await getCommunityById(id);

    oldCommunity.title = title;
    oldCommunity.updatedBy = postUpdatedBy;
    oldCommunity.categoryId = categoryId;
    oldCommunity.status = status;
    await oldCommunity.save();

    await db.models.cmsCommunityCategoryField.update(
      { value: categoryField1 },
      {
        where: { communityId: id, key: 1 },
      }
    );

    await db.models.cmsCommunityCategoryField.update(
      { value: categoryField2 },
      {
        where: { communityId: id, key: 2 },
      }
    );

    return { oldCommunity, res: true };
  } catch (err) {
    console.log("updateCommunityServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updateCommunityStatus = async (reqBody) => {
  try {
    const oldCommunity = await getCommunityById(reqBody.id);

    oldCommunity.status = reqBody.status;
    await oldCommunity.save();

    return true;
  } catch (err) {
    console.log('updateCommunityStatusServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const listCmsCommunity = async (dbInstance) => {
  try {
    const allCmsCommunityPages = await db.models.cmsCommunity.findAll({
      include: [
        {
          model: dbInstance.category,
          as: "category",
        },
      ],
      order: [["id", "DESC"]],
    });

    return allCmsCommunityPages;
  } catch (err) {
    console.log("allCmsCommunityPagesServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};


export const addCommunityPost = async (req) => {
  try {
    const {
      name,
      email,
      title,
      comment,
      categoryId,
      status,
      categoryField1,
      categoryField2,
    } = req.body;

    // Create a Community Post
    const newCommunityPost = await db.models.cmsCommunityPost.create({
      name,
      email,
      title,
      categoryId,
      status,
    });

    if (comment) {
      const newPostReply = await db.models.cmsCommunityPostComment.create({
        name,
        email,
        communityPostId: newCommunityPost.id,
        comment,
      });
    }

    const newCategoryField1 = await db.models.cmsCommunityCategoryField.create({
      communityPostId: newCommunityPost.id,
      key: 1,
      value: categoryField1,
    });

    const newCategoryField2 = await db.models.cmsCommunityCategoryField.create({
      communityPostId: newCommunityPost.id,
      key: 2,
      value: categoryField2,
    });

    return newCommunityPost;
  } catch (err) {
    console.log("addCmsPageError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getCommunityPostById = async (reqBody) => {
  const { id } = reqBody;
  try {
    const oneCommunityPost = await db.models.cmsCommunityPost.findOne({
      where: { id },
      include: [
        {
          model: db.models.cmsCommunityPostComment,
        },
      ],
    });

    if (!oneCommunityPost) {
      return false;
    }

    return oneCommunityPost;
  } catch (err) {
    console.log("getCommunityPostServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deleteCommunityPostById = async (id, dbInstance) => {
  try {
    await dbInstance.cmsCommunityPost.destroy({
      where: {
        id,
      },
    });

    return true;
  } catch (err) {
    console.log("deleteCmsPageServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const deletePostReplyById = async (id, dbInstance) => {
  try {
    await dbInstance.cmsCommunityPostComment.destroy({
      where: {
        id
      },
    });

    return true;
  } catch (err) {
    console.log("deleteCmsPageReplyServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updateCommunityPost = async (req) => {
  try {
    const reqBody = req.body;
    const { id, title, name, email, comment, categoryId, status, } =
      reqBody;

    const oldCommunityPost = await getCommunityPostById(req.body);

    oldCommunityPost.title = title;
    oldCommunityPost.name = name;
    oldCommunityPost.email = email;
    oldCommunityPost.categoryId = categoryId;
    oldCommunityPost.status = status;
    await oldCommunityPost.save();

    const getReply = await db.models.cmsCommunityPostComment.findOne(
      {
        where: { communityPostId: id, deletedAt: null, email: req.user.email},
      }
      )
      
      if(getReply){
        await db.models.cmsCommunityPostComment.update(
          { comment },
          {
            where: { communityPostId: id, email: req.user.email},
          }
        );
      } else {
        await db.models.cmsCommunityPostComment.create({
          name: name,
          email,
          communityPostId: id,
          comment,
        });
      }

    return { oldCommunityPost, res: true };
  } catch (err) {
    console.log("updateCmsPageServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const updatePageStatus = async (reqBody) => {
  try {
    const oldCmsPost = await getCommunityPostById(reqBody);

    oldCmsPost.status = reqBody.status;
    await oldCmsPost.save();

    return true;
  } catch (err) {
    console.log('updatePageServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const allCmsCommunityPosts = async (id, dbInstance) => {
  try {
    const allCmsCommunityPages = await db.models.cmsCommunityPost.findAll({
      where: {communityId: id},
      include: [
        {
          model: dbInstance.cmsCommunityPostComment,
        },
        {
          model: dbInstance.cmsCommunity,
          as: "cmsCommunity",
        },
      ],
      order: [["id", "DESC"]],
    });

    return allCmsCommunityPages;
  } catch (err) {
    console.log("allCmsCommunityPagesServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const allCmsCategories = async () => {
  try {
    const cmsCategories = await db.models.category.findAll({
      order: [["id", "DESC"]],
    });

    return cmsCategories;
  } catch (err) {
    console.log("allCmsCommunityPagesServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const allCmsSubCategories = async (dbInstance) => {
  try {
    const cmsSubCategories = await db.models.categoryField.findAll({
      include: [
        {
          model: dbInstance.category,
        },
      ],
      order: [["id", "DESC"]],
    });

    return cmsSubCategories;
  } catch (err) {
    console.log("allCmsCommunityPagesServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};