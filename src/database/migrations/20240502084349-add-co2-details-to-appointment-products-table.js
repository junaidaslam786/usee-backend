/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointment_products', 'co2_details', {
      type: Sequelize.JSON,
      field: 'co2_details',
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('appointment_products', 'co2_details');
  },
};
