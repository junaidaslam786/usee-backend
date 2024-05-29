import { DataTypes, Model } from 'sequelize';
import { SUBSCRIPTION_STATUS } from '@/config/constants';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default function (sequelize) {
  class UserSubscription extends Model {
    static associate(models) {
      UserSubscription.belongsTo(models.user, { foreignKey: 'userId' });
      UserSubscription.belongsTo(models.subscription, { foreignKey: 'subscriptionId' });
      UserSubscription.belongsTo(models.feature, { foreignKey: 'featureId' });
    }
  }

  UserSubscription.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      primaryKey: true,
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    subscriptionId: {
      primaryKey: true,
      type: DataTypes.UUID,
      references: {
        model: 'subscriptions',
        key: 'id',
      },
    },
    featureId: {
      primaryKey: true,
      type: DataTypes.UUID,
      references: {
        model: 'features',
        key: 'id',
      },
    },
    freeRemainingUnits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    paidRemainingUnits: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    autoRenew: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    autoRenewUnits: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    startDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    endDate: {
      type: DataTypes.DATE,
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'expired'),
      allowNull: false,
    },
  }, {
    modelName: 'userSubscription',
    tableName: 'user_subscriptions',
    sequelize,
  });

  UserSubscription.addHook('afterCreate', async (instance, options) => {
    // Start Logic: to check if user has already subscribed to property listing when subscribing to video call feature
    const feature = await sequelize.models.feature.findByPk(instance.featureId);
    if (feature) {
      if (feature.name === 'Video Call') {
        const user = await sequelize.models.user.findByPk(instance.userId);
        const propertyListingFeature = await sequelize.models.feature.findOne({
          where: { name: 'Property Listing' },
        });

        const propertySubscription = await sequelize.models.userSubscription.findOne({
          where: {
            userId: user.id,
            featureId: propertyListingFeature.id,
          },
        });
        if (propertySubscription) {
          const userProperties = await sequelize.models.product.findAll({
            where: {
              userId: user.id,
              status: 'active',
            },
          });
          const propertyIds = userProperties.map((property) => property.id);

          // Add free call slots against user's properties
          await sequelize.models.productSubscription.bulkCreate(propertyIds.map((propertyId) => ({
            userSubscriptionId: instance.id,
            productId: propertyId,
            freeRemainingUnits: instance.freeUnits || 4,
            paidRemainingUnits: 0,
          })), { transaction: options.transaction });
        }
      }
    }
  });

  UserSubscription.addHook('afterSave', async (instance) => {
    if (instance.changed('paidRemainingUnits')) {
      if (instance.paidRemainingUnits === 0) {
        if (instance.autoRenew) {
          // Renew the subscription using Stripe
          await instance.renewSubscriptionIfRequired();
        } else {
          instance.status = SUBSCRIPTION_STATUS.EXPIRED;
          // const updatedInstance = { ...instance.attributes, status: SUBSCRIPTION_STATUS.EXPIRED };
          // instance.set(updatedInstance);
        }
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  UserSubscription.addHook('afterDestroy', (instance) => {
    //
  });

  return UserSubscription;
}
