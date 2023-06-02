import db from "@/database";

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
      await db.models.cmsCommunityPostComment.create({
        name,
        email,
        communityPostId: newCommunityPost.id,
        comment,
      });
    }

    const newCategoryField1 = await db.models.cmsCommunityCategoryField.create({
      communityPostId: newCommunityPost.id,
      key: 1,
      value: categoryField1.value,
    });

    const newCategoryField2 = await db.models.cmsCommunityCategoryField.create({
      communityPostId: newCommunityPost.id,
      key: 2,
      value: categoryField2.value,
    });

    return [newCommunityPost, newCategoryField1, newCategoryField2];
  } catch (err) {
    console.log("addCmsPageError", err);
    return { error: true, message: "Server not responding, please try again later." };
  }
};

export const getCommunityPostById = async (user, reqBody) => {
  const { id } = reqBody;
  try {
    const oneCommunityPost = await db.models.cmsCommunityPost.findOne({
      where: { id },
      include: [
        {
          model: db.models.cmsCommunityCategoryField,
        },

        {
          model: db.models.cmsCommunityPostComment,
          where: {email: user.email}
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
    const { id, title, name, email, comment, categoryId, postAddedBy, status, categoryField1, categoryField2 } =
      reqBody;

    const oldCommunityPost = await getCommunityPostById(req.user, req.body);

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
            where: { communityPostId: id, },
          }
        );
      } else {
        await db.models.cmsCommunityPostComment.create({
          name: postAddedBy,
          email,
          communityPostId: id,
          comment,
        });
      }

    await db.models.cmsCommunityCategoryField.update(
      { value: categoryField1.value },
      {
        where: { communityPostId: id, key: 1 },
      }
    );

    await db.models.cmsCommunityCategoryField.update(
      { value: categoryField2.value },
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

export const updatePageStatus = async (user, reqBody) => {
  try {
    const oldCmsPost = await getCommunityPostById(user, reqBody);

    oldCmsPost.status = reqBody.status;
    await oldCmsPost.save();

    return true;
  } catch (err) {
    console.log('updatePageServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
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