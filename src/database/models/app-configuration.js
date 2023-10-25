import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AppConfiguration extends Model {}
  
  AppConfiguration.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    configKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    configValue: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    modelName: 'appConfiguration',
    tableName: 'app_configurations',
    sequelize,
  });
}