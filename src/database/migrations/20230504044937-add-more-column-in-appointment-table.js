module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('appointments', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'pending',
    });

    await queryInterface.addColumn('appointments', 'start_meeting_time', {
      type: Sequelize.STRING,
    });

    await queryInterface.addColumn('appointments', 'end_meeting_time', {
      type: Sequelize.STRING,
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'status');
    await queryInterface.removeColumn('appointments', 'start_meeting_time');
    await queryInterface.removeColumn('appointments', 'end_meeting_time');
  },
};
