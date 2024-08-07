import { DataTypes, Model } from 'sequelize';
// import { SUBSCRIPTION_STATUS } from '@/config/constants';
import Stripe from 'stripe';
import stripeConfig from '@/config/stripe';
import { getUserTokens, createTokenTransactionMultiple2, purchaseTokensWithStripe }
  from '@/app/agent/user/user.service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: stripeConfig.stripe.apiVersion,
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

  UserSubscription.addHook('afterSave', async (instance, options) => {
    if (instance.changed('paidRemainingUnits') && instance.paidRemainingUnits === 0
      && instance.autoRenew) {
      // Auto Renew Logic: use previously available usee coins otherwise buy minimum required coins from stripe
      try {
        const user = await sequelize.models.user.findByPk(instance.userId);
        const { stripeCustomerId } = user;

        if (!stripeCustomerId) {
          throw new Error('User does not have a Stripe customer ID');
        }

        // Fetch stripe price from local db
        const price = await sequelize.models.appConfiguration.findOne({
          where: { configKey: 'tokenPrice' },
          attributes: ['stripePriceId', 'configValue'],
        });

        if (!price) {
          throw new Error('Price not found');
        }

        console.log(' instance.autoRenewUnits: ',instance.autoRenewUnits);
        await instance.reload({ include: ['feature'] });
        console.log(' -instance.autoRenewUnits: ',instance.autoRenewUnits);
        console.log(' -instance.feature.tokensPerUnit: ', instance.feature.tokensPerUnit);
        const { totalTokensRemaining } = await getUserTokens(user.id, null, true, true);
        const totalAmount = (instance.autoRenewUnits * instance.feature.tokensPerUnit);
        const totalTokensRequired = instance.autoRenewUnits;

        // Start logic to check remaining tokens scenarios
        if (totalTokensRemaining >= totalTokensRequired) {
          // A) Use existing tokens and record the transaction
          console.log('(A)');
          const requestBody = {
            userId: user.id,
            featureId: instance.featureId,
            quantity: totalTokensRequired,
            amount: totalAmount,
            description: `Used for renewing ${instance.feature.name}`,
          };
          const deductToken = await createTokenTransactionMultiple2(user.id, requestBody, options.transaction);

          // console.log(deductToken);

          if (deductToken?.success) {
            instance.paidRemainingUnits += instance.autoRenewUnits;
            await instance.save();
          }

          console.log('Tokens deducted successfully for user:', user.id);
        } else if (totalTokensRemaining === 0) {
          // B) Purchase the required tokens if no tokens are remaining
          console.log('(B)');
          await purchaseTokensWithStripe(user, instance, totalTokensRequired, price, options.transaction);

          console.log('Tokens purchased successfully for user:', user.id);
        } else {
          // C) Partially use existing tokens and purchase the rest
          console.log('(C)');
          const tokensToPurchase = totalTokensRequired - totalTokensRemaining;

          const requestBody = {
            userId: user.id,
            featureId: instance.featureId,
            quantity: totalTokensRequired,
            amount: totalAmount,
            description: `Used for renewing ${instance.feature.name}`,
          };

          const deductToken = await createTokenTransactionMultiple2(user.id, requestBody, options.transaction);
          console.log(deductToken);
          console.log('Partial tokens deducted for user:', user.id);

          await purchaseTokensWithStripe(user, instance, tokensToPurchase, price, options.transaction);
          console.log('Remaining tokens purchased for user:', user.id);
        }
      } catch (error) {
        console.error('Error during auto-renewal for user:', instance.userId, error);
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  UserSubscription.addHook('afterDestroy', (instance) => {
    //
  });

  return UserSubscription;
}
