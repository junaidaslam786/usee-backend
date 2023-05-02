module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_alerts', 'key_id', {
      type: Sequelize.UUID
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_alerts', 'key_id');
  }
};
