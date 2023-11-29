import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Feature extends Model {
    static associate(models) {
      Feature.belongsToMany(models.subscription, {
        through: 'SubscriptionFeatures',
        foreignKey: 'featureId'
      });
      Feature.hasMany(models.userSubscription, { foreignKey: 'featureId' });
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
      type: DataTypes.FLOAT,
      allowNull: false
    },
    totalUnits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    freeUnits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    unitName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unitType: {
      type: DataTypes.STRING,
      enum: ["number", "minute", "hour", "day", "week", "month"]
    },
    featureType: {
      type: DataTypes.STRING,
      enum: ["feature", "addon"]
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true
    }
  }, {
    modelName: 'feature',
    tableName: 'features',
    sequelize,
    paranoid: true
  });

  return Feature;
}