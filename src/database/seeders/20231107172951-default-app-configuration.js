import { v4 } from 'uuid';

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('app_configurations', [{
      id: v4(),
      config_key: 'tokenPrice',
      config_value: '5',
      description: 'This is the price for a single token in USEE360. These tokens will be used to purchase services in the app.',
      stripe_product_id: 'prod_P4W0XpwFd7MXLR',
      stripe_price_id: 'price_1OGMyKJ6zXdtc21ylldhy8VS',
      created_at: new Date(),
      updated_at: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('app_configurations', null, {});
  }
};
