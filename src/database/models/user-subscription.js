import { DataTypes, Model } from 'sequelize';
// import { SUBSCRIPTION_STATUS } from '@/config/constants';
import Stripe from 'stripe';
import stripeConfig from '@/config/stripe';

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
    if (instance.changed('paidRemainingUnits') && instance.paidRemainingUnits === 0 && instance.autoRenew) {
      try {
        const user = await sequelize.models.user.findByPk(instance.userId);
        const { stripeCustomerId } = user;

        if (!stripeCustomerId) {
          throw new Error('User does not have a Stripe customer ID');
        }

        // Fetch price from stripe
        const price = await sequelize.models.appConfiguration.findOne({
          where: { configKey: 'tokenPrice' },
          attributes: ['stripePriceId', 'configValue'],
        });

        if (!price) {
          throw new Error('Price not found');
        }

        // Create an invoice for the customer
        const invoice = await stripe.invoices.create({
          customer: stripeCustomerId,
          auto_advance: true,
          collection_method: 'charge_automatically',
        });

        // Create an invoice item for the product
        // eslint-disable-next-line no-unused-vars
        const invoiceItem = await stripe.invoiceItems.create({
          customer: stripeCustomerId,
          invoice: invoice.id,
          price: price.stripePriceId,
          quantity: instance.autoRenewUnits,
        });

        // eslint-disable-next-line no-unused-vars
        const invoicePaid = await stripe.invoices.pay(invoice.id);

        const totalAmount = instance.autoRenewUnits * price.configValue;

        // Add the tokens to the user's account in your database
        const token = await sequelize.models.token.create({
          userId: user.id,
          quantity: instance.autoRenewUnits,
          price: price.configValue,
          totalAmount,
          remainingAmount: instance.autoRenewUnits,
          stripeInvoiceId: invoice.id,
          stripeInvoiceStatus: invoice.status,
          // stripeInvoiceStatus: invoicePaid.status === 'paid' ? invoicePaid.status : invoice.status,
        }, { transaction: options.transaction });

        if (invoicePaid.status !== 'paid') {
          throw new Error('Invoice creation failed');
        }

        // Update userSubscription.paidRemainingUnits after successful payment
        await sequelize.models.userSubscription.update(
          {
            paidRemainingUnits: instance.autoRenewUnits,
          },
          {
            where: {
              id: instance.id,
            },
            transaction: options.transaction,
          },
        );
        console.log('Subscription auto-renewed successfully for user:', instance.userId, token);
      } catch (error) {
        console.error('Error during auto-renewal for user:', instance.userId, error);
        // Implement further error handling (e.g., notify admins, retry logic)
      }
    }
  });

  // eslint-disable-next-line no-unused-vars
  UserSubscription.addHook('afterDestroy', (instance) => {
    //
  });

  return UserSubscription;
}
