import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsPageCategoryField extends Model {
    static associate(models) {
      CmsPageCategoryField.belongsTo(models.cmsPage, { foreignKey: 'pageId' });
      CmsPageCategoryField.belongsTo(models.categoryField, { foreignKey: 'key' });
    }
  }

  CmsPageCategoryField.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    pageId: {
      type: DataTypes.UUID,
      field: 'page_id',
      references: {
        model: 'cms_pages',
        key: 'id',
      },
    },
    key: {
      type: DataTypes.INTEGER,
      field: 'key',
      references: {
        model: 'category_fields',
        key: 'id',
      },
    },
    value: {
      type: DataTypes.STRING,
      field: 'value',
    },
  }, {
    modelName: 'cmsPageCategoryField',
    tableName: 'cms_page_category_fields',
    sequelize,
    paranoid: true,
  });

  CmsPageCategoryField.addHook('beforeSave', async (instance) => {
    //
  });

  CmsPageCategoryField.addHook('afterCreate', (instance) => {
    //
  });

  CmsPageCategoryField.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsPageCategoryField;
}
