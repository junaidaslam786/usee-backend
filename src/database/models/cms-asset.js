import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsAssets extends Model {
    static associate(models) {
      CmsAssets.belongsTo(models.cmsPage, { foreignKey: 'pageId' })
    }
  }

  CmsAssets.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    pageId: {
      type: DataTypes.STRING,
      field: 'page_id',
      references: {
        model: 'cms_pages',
        key: 'id',
      }
    },
    url: {
      type: DataTypes.STRING,
      field: 'url'
    },
  }, {
    modelName: 'cmsAsset',
    tableName: 'cms_assets',
    sequelize,
    paranoid: true,
  });

  CmsAssets.addHook('beforeSave', async (instance) => {
    //
  });

  CmsAssets.addHook('afterCreate', (instance) => {
    //
  });

  CmsAssets.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsAssets;
}
