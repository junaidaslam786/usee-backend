import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class SubscriptionFeature extends Model {
    static associate(models) {
      SubscriptionFeature.belongsTo(models.subscription, {
        foreignKey: 'subscriptionId'
      });
      SubscriptionFeature.belongsTo(models.feature, {
        foreignKey: 'featureId'
      });
    }
  }

  SubscriptionFeature.init({
    featureId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'features',
        key: 'id'
      },
    },
    subscriptionId: {
      type: DataTypes.UUID,
      primaryKey: true,
      references: {
        model: 'subscriptions',  // Assuming your Subscription model's table name is 'subscriptions'
        key: 'id'
      },
    }
  }, {
    modelName: 'SubscriptionFeature',
    tableName: 'SubscriptionFeatures',
    sequelize,
  });

  return SubscriptionFeature;
}
