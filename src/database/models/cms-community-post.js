import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsCommunityPost extends Model {
    static associate(models) {
      CmsCommunityPost.belongsTo(models.category, { foreignKey: 'categoryId' }),
      CmsCommunityPost.hasMany(models.cmsCommunityCategoryField, { foreignKey: 'communityPostId' }),
      CmsCommunityPost.hasMany(models.cmsCommunityPostComment, { foreignKey: 'communityPostId'})
    }
  }

  CmsCommunityPost.init({
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
      field: 'title',
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      field: 'name',
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      field: 'email',
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      field: 'status',
      defaultValue: true
    },
  }, {
    modelName: 'cmsCommunityPost',
    tableName: 'cms_community_posts',
    sequelize,
    paranoid: true
  });

  CmsCommunityPost.addHook('beforeSave', async (instance) => {
    //
  });

  CmsCommunityPost.addHook('afterCreate', (instance) => {
    //
  });

  CmsCommunityPost.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsCommunityPost;
}
