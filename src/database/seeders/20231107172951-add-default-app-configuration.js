'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('app_configurations', [{
      id: Sequelize.UUIDV4(),
      configKey: 'tokenPrice',
      configValue: '10',
      description: 'This is the price for a single token in USEE360. These tokens will be used to purchase services in the app.',
      stripeProductId: 'prod_OxkEHqzEUtR6P5',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('app_configurations', null, {});
  }
};
