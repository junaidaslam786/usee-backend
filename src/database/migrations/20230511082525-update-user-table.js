'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'signup_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    await queryInterface.addColumn('users', 'otp_verified', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'otp_verified');
    await queryInterface.removeColumn('users', 'signup_step');
  }
};
