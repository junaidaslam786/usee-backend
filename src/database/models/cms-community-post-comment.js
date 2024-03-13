import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsCommunityPostComment extends Model {
    static associate(models) {
      CmsCommunityPostComment.belongsTo(models.cmsCommunityPost, { foreignKey: 'communityPostId' });
    }
  }

  CmsCommunityPostComment.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    communityPostId: {
      type: DataTypes.UUID,
      field: 'community_post_id',
      references: {
        model: 'cms_community_posts',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      field: 'name',
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      field: 'email',
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      field: 'comment',
      allowNull: false,
    },
  }, {
    modelName: 'cmsCommunityPostComment',
    tableName: 'cms_community_post_comments',
    sequelize,
    paranoid: true,
  });

  CmsCommunityPostComment.addHook('beforeSave', async (instance) => {
    //
  });

  CmsCommunityPostComment.addHook('afterCreate', (instance) => {
    //
  });

  CmsCommunityPostComment.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsCommunityPostComment;
}
