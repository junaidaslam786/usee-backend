import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Feature extends Model {
    static associate(models) {
      Feature.belongsToMany(models.subscription, {
        through: 'SubscriptionFeatures',
        foreignKey: 'featureId'
      });
    }
  }

  Feature.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    tokensPerUnit: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dailyTokenLimit: {
      type: DataTypes.INTEGER
    },
    totalUnits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    maxPurchaseLimit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    featureType: {
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  }, {
    modelName: 'feature',
    tableName: 'features',
    sequelize,
  });

  return Feature;
}