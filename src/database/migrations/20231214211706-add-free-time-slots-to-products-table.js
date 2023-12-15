'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'free_time_slots', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0.0,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'free_time_slots');
  }
};
