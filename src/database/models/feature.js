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
      type: DataTypes.FLOAT,
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
      type: DataTypes.STRING,
      enum: ["feature", "addon"]
    },
    stripeProductId: {
      type: DataTypes.STRING,
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

  // Add an afterSave hook to create a Stripe product
  // Feature.afterCreate(async (feature, options) => {
  //   console.log("FEATURE: ", feature);
  //   try {
  //     // Check if the Stripe product has already been created
  //     if (feature.stripeProductId) {
  //       return;
  //     }

  //     // Create a Stripe product
  //     const product = await stripe.products.create({
  //       name: feature.name,
  //       type: 'good',
  //       description: feature.description,
  //       attributes: ['color', 'size'],
  //     });

  //     // Associate the Stripe product with the feature instance
  //     feature.stripeProductId = product.id;
  //     await feature.save();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  // Add an onupdate hook to update the Stripe product price
  // Feature.afterUpdate(async (feature, options) => {
  //   try {
  //     // Check if the Stripe product has already been created
  //     if (!feature.stripeProductId) {
  //       return;
  //     }

  //     // Get the Stripe product
  //     const product = await stripe.products.retrieve(feature.stripeProductId);

  //     // Update the Stripe product
  //     await stripe.products.update(feature.stripeProductId, {
  //       name: feature.name,
  //       description: feature.description,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  return Feature;
}