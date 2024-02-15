/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'otp_code', {
      type: Sequelize.INTEGER,
      defaultValue: null,
    });

    await queryInterface.addColumn('users', 'otp_expiry', {
      type: Sequelize.DATE,
      defaultValue: null,
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'otp_code');
    await queryInterface.removeColumn('users', 'otp_expiry');
  },
};
