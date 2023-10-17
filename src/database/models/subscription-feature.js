import { DataTypes, Model } from 'sequelize';

class SubscriptionFeature extends Model {}

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

export default SubscriptionFeature;
