import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class SubscriptionFeature extends Model {
    static associate(models) {
      SubscriptionFeature.belongsTo(models.subscription, {
        foreignKey: 'subscription_id',
      });
      SubscriptionFeature.belongsTo(models.feature, {
        foreignKey: 'feature_id',
      });
    }
  }

  SubscriptionFeature.init({
    featureId: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: 'feature_id',
      references: {
        model: 'features',
        key: 'id',
      },
    },
    subscriptionId: {
      type: DataTypes.UUID,
      primaryKey: true,
      field: 'subscription_id',
      references: {
        model: 'subscriptions', // Assuming your Subscription model's table name is 'subscriptions'
        key: 'id',
      },
    },
  }, {
    modelName: 'subscriptionFeature',
    tableName: 'subscription_features',
    sequelize,
  });

  return SubscriptionFeature;
}
