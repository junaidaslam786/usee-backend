import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsCommunityCategoryField extends Model {
    static associate(models) {
      CmsCommunityCategoryField.belongsTo(models.cmsCommunityPost, { foreignKey: 'communityPostId' })
      CmsCommunityCategoryField.belongsTo(models.categoryField, { foreignKey: 'key' })
    }
  }

  CmsCommunityCategoryField.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    communityPostId: {
      type: DataTypes.UUID,
      field: 'community_post_id',
      references: {
        model: 'cms_community_posts',
        key: 'id'
      }
    },
    key: {
      type: DataTypes.INTEGER,
      field: 'key',
      references: {
        model: 'category_fields',
        key: 'id'
      }
    },
    value: {
      type: DataTypes.STRING,
      field: 'value'
    },
  }, {
    modelName: 'cmsCommunityCategoryField',
    tableName: 'cms_community_category_fields',
    sequelize,
    paranoid: true
  });

  CmsCommunityCategoryField.addHook('beforeSave', async (instance) => {
    //
  });

  CmsCommunityCategoryField.addHook('afterCreate', (instance) => {
    //
  });

  CmsCommunityCategoryField.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsCommunityCategoryField;
}