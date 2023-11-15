'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'stripe_customer_id', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'stripe_payment_method_id', {
      type: Sequelize.STRING,
      allowNull: true
    }); 
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'stripe_customer_id');
    await queryInterface.removeColumn('users', 'stripe_payment_method_id');
  }
};
