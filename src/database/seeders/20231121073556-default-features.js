import { v4 } from 'uuid';

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('features', [{
      id: '159c869a-1b24-4cd3-ac61-425645b730c7',
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
      id: '989d96e5-e839-4fe2-8f3e-bb6a5b2d30a2',
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
      id: '3ae5fd58-6cca-4e51-b368-1a3a310d99fc',
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
      id: '02d5274e-0739-4032-87fa-620211a31700',
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
