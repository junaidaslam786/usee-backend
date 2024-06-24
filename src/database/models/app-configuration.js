import { DataTypes, Model } from 'sequelize';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export default function (sequelize) {
  class AppConfiguration extends Model { }

  AppConfiguration.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    configKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'config_key',
    },
    configValue: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'config_value',
    },
    description: {
      type: DataTypes.TEXT,
    },
    stripeProductId: {
      type: DataTypes.STRING,
      field: 'stripe_product_id',
    },
    stripePriceId: {
      type: DataTypes.STRING,
      field: 'stripe_price_id',
    },
  }, {
    modelName: 'appConfiguration',
    tableName: 'app_configurations',
    sequelize,
    paranoid: true,
  });

  // eslint-disable-next-line no-unused-vars
  AppConfiguration.addHook('beforeBulkUpdate', async (appConfiguration, options) => {
    if (appConfiguration.attributes.configKey === 'tokenPrice') {
      console.log('Updating token price on stripe');
      // Retrieve Token product from stripe
      const product = await stripe.products.retrieve('prod_P4W0XpwFd7MXLR');

      // create a new price for the product
      const price = await stripe.prices.create({
        unit_amount: appConfiguration.attributes.configValue * 100,
        currency: 'aed',
        product: product.id,
        lookup_key: 'token_price',
        transfer_lookup_key: true,
      });

      // update default price of the product
      const productUpdate = await stripe.products.update(
        product.id,
        {
          default_price: price.id,
        },
      );

      if (productUpdate) {
        appConfiguration.attributes.stripePriceId = price.id;
        // const updatedAppConfiguration = { ...appConfiguration.attributes, stripePriceId: price.id };
        // appConfiguration.set(updatedAppConfiguration);
      }
    }
  });
}
