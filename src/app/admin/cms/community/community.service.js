import db from "@/database";

export const addCommunityPost = async (req) => {
  try {
    const {
      name,
      email,
      title,
      comment,
      categoryId,
      questionAskedBy,
      answeredBy,
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
      questionAskedBy,
      answeredBy,
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
      key: categoryField1[0].key,
      value: categoryField1[0].value,
    });

    const newCategoryField2 = await db.models.cmsCommunityCategoryField.create({
      communityPostId: newCommunityPost.id,
      key: categoryField2[0].key,
      value: categoryField2[0].value,
    });

    return [newCommunityPost, newCategoryField1, newCategoryField2];
  } catch (err) {
    console.log("addCmsPageError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getCommunityPostById = async (reqBody) => {
  const { id } = reqBody;
  try {
    const OneCommunityPost = await db.models.cmsCommunityPost.findOne({
      where: { id },
      include: [
        {
          model: db.models.cmsCommunityCategoryField,
        },

        {
          model: db.models.cmsCommunityPostComment,
        },
      ],
    });

    if (!OneCommunityPost) {
      return false;
    }

    return OneCommunityPost;
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
    const { id, title, name, email, comment, categoryId, postAddedBy, status, categoryField1, categoryField2 } =
      reqBody;

      console.log(reqBody)
    const oldCommunityPost = await getCommunityPostById({ id });

    oldCommunityPost.title = title;
    oldCommunityPost.name = name;
    oldCommunityPost.email = email;
    oldCommunityPost.categoryId = categoryId;
    oldCommunityPost.status = status;
    await oldCommunityPost.save();

    const getReply = await db.models.cmsCommunityPostComment.findOne(
      {
        where: { communityPostId: id, deletedAt: null},
      }
      )
      
      if(getReply){
        const updatePostComment = await db.models.cmsCommunityPostComment.update(
          { comment },
          {
            where: { communityPostId: id, },
          }
        );
      } else {
        const updatePostComment = await db.models.cmsCommunityPostComment.create({
          name: postAddedBy,
          email,
          communityPostId: id,
          comment,
        });
      }

    const updateCategoryField1 = await db.models.cmsCommunityCategoryField.update(
      { value: categoryField1[0].value },
      {
        where: { communityPostId: id, key: 1 },
      }
    );

    const updateCategoryField2 = await db.models.cmsCommunityCategoryField.update(
      { value: categoryField2[0].value },
      {
        where: { communityPostId: id, key: 2 },
      }
    );

    return { oldCommunityPost, res: true };
  } catch (err) {
    console.log("updateCmsPageServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const allCmsCommunityPosts = async (dbInstance) => {
  try {
    const allCmsCommunityPages = await db.models.cmsCommunityPost.findAll({
      include: [
        {
          model: dbInstance.cmsCommunityPostComment,
        },
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
    const CmsSubCategories = await db.models.categoryField.findAll({
      include: [
        {
          model: dbInstance.category,
        },
      ],
      order: [["id", "DESC"]],
    });

    return CmsSubCategories;
  } catch (err) {
    console.log("allCmsCommunityPagesServiceError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};
