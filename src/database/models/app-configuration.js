import { DataTypes, Model } from 'sequelize';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
})

export default function (sequelize) {
  class AppConfiguration extends Model { }

  AppConfiguration.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    configKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "config_key",
    },
    configValue: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "config_value",
    },
    description: {
      type: DataTypes.TEXT
    },
    stripeProductId: {
      type: DataTypes.STRING,
      field: "stripe_product_id",
    },
  }, {
    modelName: 'appConfiguration',
    tableName: 'app_configurations',
    sequelize,
    paranoid: true
  });

  // update handler method to change price of a stripe product using api
  AppConfiguration.addHook('beforeBulkUpdate', async (appConfiguration, options) => {

    if (appConfiguration.attributes.configKey === 'tokenPrice') {
      const product = await stripe.products.retrieve("prod_OxkEHqzEUtR6P5");
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
        }
      );
    }
  });
}