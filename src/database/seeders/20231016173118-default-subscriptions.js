import { v4 } from 'uuid';

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('subscriptions', [
      {
        id: v4(),
        name: 'Basic',
        price: 10.00,
        duration: 30,
        description: 'Basic Subscription Plan',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('subscriptions', null, {});
  }
};
