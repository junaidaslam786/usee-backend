import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class UserCallBackgroundImage extends Model {
    static associate(models) {
      UserCallBackgroundImage.belongsTo(models.user, { foreignKey: 'userId' });
    }
  }

  UserCallBackgroundImage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.TEXT,
    },
    url: {
      type: DataTypes.STRING,
    },
  }, {
    modelName: 'userCallBackgroundImage',
    tableName: 'user_call_background_images',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  UserCallBackgroundImage.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  UserCallBackgroundImage.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  UserCallBackgroundImage.addHook('afterDestroy', (instance) => {
    //
  });

  return UserCallBackgroundImage;
}
