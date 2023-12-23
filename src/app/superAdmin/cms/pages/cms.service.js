import db from '@/database';
import { utilsHelper } from '@/helpers';
import { CMS_ROOT_PATHS } from '../../../../config/constants';

export const addCmsPage = async (req) => {

  try {
    const {
      title, description, pageType, slug, assetId, createdBy, status,
      categoryField1,
      categoryField2,
      categoryId,
      image,
      file
    } = req.body;

    // Create a page
    const newCmsPage = await db.models.cmsPage.create({
      title,
      description,
      slug,
      pageType,
      createdBy,
      status,
      categoryId,
      file,
      featuredImage: image
    });

    if(assetId){
      const asset = await db.models.cmsAsset.findOne({ where: { id: assetId } });
      asset.pageId = newCmsPage.id
      asset.save()
    }

    const newCategoryField1 = await db.models.cmsPageCategoryField.create({
      pageId: newCmsPage.id,
      key: 1,
      value: categoryField1,
    });

    const newCategoryField2 = await db.models.cmsPageCategoryField.create({
      pageId: newCmsPage.id,
      key: 2,
      value: categoryField2,
    });

    // feature image upload
    if (req.files && req.files.image) {
      const featuredImageFile = req.files.image;
      const newImageName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
      const result = await utilsHelper.fileUpload(featuredImageFile, CMS_ROOT_PATHS.FEATURE_IMAGE, newImageName);
      if (result?.error) {
          return { error: true, message: result?.error }
      } 


      newCmsPage.featuredImageFile = result;
      await newCmsPage.save();
  }

  // file upload
  if (req.files && req.files.file) {
    const file = req.files.file;
    const newFileName = `${Date.now()}_${file.name.replace(/ +/g, "")}`;
    const result2 = await utilsHelper.fileUpload(file, CMS_ROOT_PATHS.DOCUMENT, newFileName);
    if (result2?.error) {
        return { error: true, message: result2?.error }
    } 

    newCmsPage.file = result2;
    await newCmsPage.save();
  }

    return newCmsPage;
  } catch (err) {
    console.log('addCmsPageError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const addCmsPageImg = async (req) => {
  try {

    // Upload page description images
    const uploadedImg = await db.models.cmsAsset.create({
      pageType: req.body.PageType
    });

    // feature image upload
    if (req.files && req.files.files) {
      const featuredImageFile = req.files.files;
      const newImageName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
      const result = await utilsHelper.fileUpload(featuredImageFile, CMS_ROOT_PATHS.FEATURE_IMAGE, newImageName);
      if (result?.error) {
          return { error: true, message: result?.error }
      } 
      uploadedImg.url = result;
      await uploadedImg.save();
  }

    return uploadedImg;
  } catch (err) {
    console.log('addCmsPageImgError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const allCmsPages = async (reqBody, dbInstance) => {
  try {
    const { pageType } = reqBody
    const allCmsPages = await db.models.cmsPage.findAll({
      where: {pageType},
      include: [{
        model: dbInstance.cmsAsset,
        required: false,
      }],
      order: [['id', 'DESC']],
    });

    return allCmsPages
  } catch (err) {
    console.log('allCmsPagesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const getCmsPageById = async (reqBody) => {
  const { id } = reqBody;
  try {
    const OneCmsPage = await db.models.cmsPage.findOne({ 
      where: { id },
      include: [
        {
          model: db.models.cmsPageCategoryField,
        },
      ],
     });

    if (!OneCmsPage) {
      return false;
    }

    return OneCmsPage;
  } catch (err) {
    console.log('getCmsPageServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const deleteCmsPageById = async (id, dbInstance) => {
  try {
    await dbInstance.cmsPage.destroy({
      where: {
        id,
      },
    });

    return true;
  } catch (err) {
    console.log('deleteCmsPageServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const updateCmsPage = async (req) => {
  try {
    const reqBody = req.body;
    const {
      id,
      email,
      title,
      description,
      slug,
      pageType,
      createdBy,
      status,
      categoryId,
      categoryField1,
      categoryField2,
     } = reqBody;

    const oldPage = await getCmsPageById(reqBody);

    oldPage.title = title,
    oldPage.description = description,
    oldPage.slug = slug,
    oldPage.pageType = pageType,
    oldPage.createdBy = createdBy,
    oldPage.status = status,
    oldPage.categoryId = categoryId
    await oldPage.save();
    
    const updateCategoryField1 = await db.models.cmsPageCategoryField.update(
      { value: categoryField1 },
      {
        where: { pageId: id, key: 1 },
      }
    );

    const updateCategoryField2 = await db.models.cmsPageCategoryField.update(
      { value: categoryField2 },
      {
        where: { pageId: id, key: 2 },
      }
    );

      // feature image upload
      if (req.files && req.files.image) {
        const featuredImageFile = req.files.image;
        const removeImg = utilsHelper.removeFile(oldPage.featuredImageFile)
        const newImageName = `${Date.now()}_${featuredImageFile.name.replace(/ +/g, "")}`;
        const result = await utilsHelper.fileUpload(featuredImageFile, CMS_ROOT_PATHS.FEATURE_IMAGE, newImageName);
        if (result?.error) {
            return { error: true, message: result?.error }
        } 
  
        oldPage.featuredImageFile = result;
        oldPage.user_id = id,
        oldPage.created_by = id,
        await oldPage.save();
    }
  
    // file upload
    if (req.files && req.files.file) {
      const file = req.files.file;
      oldPage.file ?? utilsHelper.removeFile(oldPage.file)
      const newFileName = `${Date.now()}_${file.name.replace(/ +/g, "")}`;
      const result2 = await utilsHelper.fileUpload(file, CMS_ROOT_PATHS.DOCUMENT, newFileName);
      if (result2?.error) {
          return { error: true, message: result2?.error }
      } 
  
      oldPage.file = result2;
      await oldPage.save();
    }

    return true;
  } catch (err) {
    console.log('updateCmsPageServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

export const updatePageStatus = async (reqBody) => {
  try {
    const oldPage = await getCmsPageById(reqBody);

    oldPage.status = reqBody.status;
    oldPage.createdBy = reqBody.email;

    await oldPage.save();

    return true;
  } catch (err) {
    console.log('updateAgentUserSortingServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};

/**
 * Community pages
 */
export const allCmsCommunityPages = async (reqBody, dbInstance) => {
  try {
    const { pageType } = reqBody
    const allCmsCommunityPages = await db.models.cmsCommunityPage.findAll({
      include: [{
        model: dbInstance.categoryField,
        as: 'cmsCommunityPages',
      }],
      order: [['id', 'DESC']],
    });

    return allCmsCommunityPages
  } catch (err) {
    console.log('allCmsCommunityPagesServiceError', err);
    return { error: true, message: 'Server not responding, please try again later.' };
  }
};