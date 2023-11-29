import { v4 } from 'uuid';

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('features', [{
      id: v4(),
      name: 'Video Call',
      description: 'Enable video calls for users.',
      tokens_per_unit: 5.0,
      total_units: 30.0,
      free_units: 4.0,
      unit_name: 'time_slots',
      unit_type: 'minute',
      feature_type: 'feature',
    },
    {
      id: v4(),
      name: 'Property Listing',
      description: 'List and manage properties on your platform.',
      tokens_per_unit: 8.0,
      total_units: 50,
      free_units: 10,
      unit_name: 'properties',
      unit_type: 'number',
      feature_type: 'feature',
    },
    {
      id: v4(),
      name: 'API Subscription',
      description: 'Provide access to your API with a subscription model.',
      tokens_per_unit: 10.0,
      total_units: 100,
      free_units: 50,
      unit_name: 'api_calls',
      unit_type: 'number',
      feature_type: 'addon',
    },
    {
      id: v4(),
      name: 'Analytics & Reporting',
      description: 'Provide access to your API with a subscription model.',
      tokens_per_unit: 5.0,
      total_units: 50,
      free_units: 5,
      unit_name: 'report_downloads',
      unit_type: 'number',
      feature_type: 'addon',
    }], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('features', null, {});
  }
};
