import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class ProductSubscription extends Model {
    static associate(models) {
      ProductSubscription.belongsTo(models.userSubscription, { foreignKey: 'userSubscriptionId' });
      ProductSubscription.belongsTo(models.product, { foreignKey: 'productId' });
    }
  }

  ProductSubscription.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userSubscriptionId: {
      type: DataTypes.UUID,
      references: {
        model: 'user_subscriptions',
        key: 'id',
      },
    },
    productId: {
      type: DataTypes.UUID,
      references: {
        model: 'products',
        key: 'id',
      },
    },
    freeRemainingUnits: {
      type: DataTypes.FLOAT,
    },
    paidRemainingUnits: {
      type: DataTypes.FLOAT,
    },
    videoCallsMissed: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    modelName: 'productSubscription',
    tableName: 'product_subscriptions',
    sequelize,
  });

  return ProductSubscription;
}
