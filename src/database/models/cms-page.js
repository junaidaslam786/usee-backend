import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsPages extends Model {
    static associate(models) {
      CmsPages.belongsTo(models.category, { foreignKey: 'categoryId' }),
      CmsPages.hasMany(models.cmsAsset, { foreignKey: 'pageId' }),
      CmsPages.hasMany(models.cmsPageCategoryField, { foreignKey: 'pageId' })
    }
  }

  CmsPages.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    categoryId: {
      type: DataTypes.INTEGER,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'id',
      }
    },
    title: {
      type: DataTypes.TEXT,
      field: 'title'
    },
    description: {
      type: DataTypes.TEXT,
      field: 'description'
    },
    featuredImageFile: {
      type: DataTypes.STRING,
      field: 'featured_image'
    },
    file: {
      type: DataTypes.STRING,
      field: 'file'
    },
    status: {
      type: DataTypes.STRING,
      field: 'status'
    },
    slug: {
      type: DataTypes.STRING,
      field: 'slug'
    },
    createdBy: {
      type: DataTypes.STRING,
      field: 'created_by'
    },
    pageType: {
      type: DataTypes.STRING,
      field: 'page_type'
    },
  }, {
    modelName: 'cmsPage',
    tableName: 'cms_pages',
    sequelize,
    paranoid: true
  });

  CmsPages.addHook('beforeSave', async (instance) => {
    //
  });

  CmsPages.addHook('afterCreate', (instance) => {
    //
  });

  CmsPages.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsPages;
}
