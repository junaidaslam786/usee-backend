import { v4 } from 'uuid';

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // return queryInterface.bulkInsert('features', [{
    //   id: v4(),
    //   name: 'Video Call',
    //   description: 'Enable video calls for users.',
    //   tokensPerUnit: 1.5,
    //   dailyTokenLimit: 10,
    //   totalUnits: 100,
    //   maxPurchaseLimit: 50,
    //   featureType: 'feature',
    // },
    // {
    //   id: v4(),
    //   name: 'Property Listing',
    //   description: 'List and manage properties on your platform.',
    //   tokensPerUnit: 2.0,
    //   dailyTokenLimit: 20,
    //   totalUnits: 200,
    //   maxPurchaseLimit: 100,
    //   featureType: 'feature',
    // },
    // {
    //   id: v4(),
    //   name: 'API Subscription',
    //   description: 'Provide access to your API with a subscription model.',
    //   tokensPerUnit: 1.0,
    //   dailyTokenLimit: 5,
    //   totalUnits: 50,
    //   maxPurchaseLimit: 25,
    //   featureType: 'addon',
    // },
    // {
    //   id: v4(),
    //   name: 'Analytics & Reporting',
    //   description: 'Provide access to your API with a subscription model.',
    //   tokensPerUnit: 5.0,
    //   dailyTokenLimit: 5,
    //   totalUnits: 50,
    //   maxPurchaseLimit: 25,
    //   featureType: 'addon',
    // }], {});
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('features', null, {});
  }
};
