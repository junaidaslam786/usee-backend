/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('appointments', 'co2_details', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('appointments', 'co2_details');
  },
};
