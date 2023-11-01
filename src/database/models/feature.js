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
      // allowNull: false
    },
    dailyTokenLimit: {
      type: DataTypes.INTEGER
    },
    totalUnits: {
      type: DataTypes.FLOAT,
      // allowNull: false,
    },
    maxPurchaseLimit: {
      type: DataTypes.FLOAT,
      // allowNull: false,
    },
    featureType: {
      type: DataTypes.FLOAT,
      // allowNull: false,
    }
  }, {
    modelName: 'feature',
    tableName: 'features',
    sequelize,
  });

  // Add an afterSave hook to create a Stripe product
  Feature.afterCreate(async (feature, options) => {
    try {
      // Check if the Stripe product has already been created
      if (feature.stripeProductId) {
        return;
      }

      // Create a Stripe product
      const product = await stripeClient.products.create({
        name: feature.name,
        type: 'good',
        description: feature.description,
        attributes: ['color', 'size'],
      });

      // Associate the Stripe product with the feature instance
      feature.stripeProductId = product.id;
      await feature.save();
    } catch (error) {
      console.error(error);
    }
  });

  return Feature;
}