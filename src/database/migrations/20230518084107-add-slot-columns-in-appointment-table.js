module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('appointments', 'appointment_time_gmt', {
      type: Sequelize.STRING,
      defaultValue: null,
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'appointment_time_gmt');
  },
};
