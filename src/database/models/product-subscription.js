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

  // eslint-disable-next-line no-unused-vars
  ProductSubscription.addHook('beforeSave', async (instance) => {
    //
  });

  ProductSubscription.addHook('afterSave', async (instance, options) => {
    if (instance.changed('videoCallsMissed')) {
      if (instance.videoCallsMissed === 2) {
        // Discard the remaining free units if agent misses two consecutive calls
        await sequelize.models.productSubscription.update({
          freeRemainingUnits: 0,
        }, {
          where: { id: instance.id },
        }, { transaction: options.transaction });
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  ProductSubscription.addHook('afterCreate', async (instance, options) => {
    const userSubscription = await sequelize.models.userSubscription.findByPk(instance.userSubscriptionId);
    const feature = await sequelize.models.feature.findByPk(userSubscription.featureId);

    if (feature) {
      if (feature.name === 'Snag List') {
        if (userSubscription.freeRemainingUnits > 0) {
          userSubscription.freeRemainingUnits -= 1;
          await userSubscription.save();
        } else if (userSubscription.paidRemainingUnits > 0) {
          userSubscription.paidRemainingUnits -= 1;
          await userSubscription.save();
        } else {
          console.log({ error: true, message: 'Not enough units to use snag list feature.' });
        }
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  ProductSubscription.addHook('afterDestroy', (instance) => {
    //
  });

  return ProductSubscription;
}
