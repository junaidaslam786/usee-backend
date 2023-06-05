import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class CmsCommunity extends Model {
    static associate(models) {
      CmsCommunity.belongsTo(models.category, { foreignKey: 'categoryId' }),
      CmsCommunity.hasMany(models.cmsCommunityCategoryField, { foreignKey: 'communityId' }),
      CmsCommunity.hasMany(models.cmsCommunityPost, { foreignKey: 'communityId'})
    }
  }

  CmsCommunity.init({
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
    status: {
      type: DataTypes.STRING,
      field: 'status',
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.UUID,
      field: 'created_by',
      allowNull: true
    },
    updatedBy: {
      type: DataTypes.UUID,
      field: 'updated_by',
      allowNull: true
    },
  }, {
    modelName: 'cmsCommunity',
    tableName: 'cms_community',
    sequelize,
    paranoid: true
  });

  CmsCommunity.addHook('beforeSave', async (instance) => {
    //
  });

  CmsCommunity.addHook('afterCreate', (instance) => {
    //
  });

  CmsCommunity.addHook('afterDestroy', (instance) => {
    //
  });

  return CmsCommunity;
}
