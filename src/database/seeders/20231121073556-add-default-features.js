import { v4 } from 'uuid';

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('features', [{
      id: v4(),
      name: 'Video Call',
      description: 'Enable video calls for users.',
      tokens_per_unit: 1.5,
      daily_token_limit: 10,
      total_units: 100,
      max_purchase_limit: 50,
      feature_type: 'feature',
    },
    {
      id: v4(),
      name: 'Property Listing',
      description: 'List and manage properties on your platform.',
      tokens_per_unit: 2.0,
      daily_token_limit: 20,
      total_units: 200,
      max_purchase_limit: 100,
      feature_type: 'feature',
    },
    {
      id: v4(),
      name: 'API Subscription',
      description: 'Provide access to your API with a subscription model.',
      tokens_per_unit: 1.0,
      daily_token_limit: 5,
      total_units: 50,
      max_purchase_limit: 25,
      feature_type: 'addon',
    },
    {
      id: v4(),
      name: 'Analytics & Reporting',
      description: 'Provide access to your API with a subscription model.',
      tokens_per_unit: 5.0,
      daily_token_limit: 5,
      total_units: 50,
      max_purchase_limit: 25,
      feature_type: 'addon',
    }], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('features', null, {});
  }
};
