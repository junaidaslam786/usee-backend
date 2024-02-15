module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('user_alerts', 'agent_id', {
      type: Sequelize.UUID,
      onDelete: 'CASCADE',
      references: {
        model: 'users',
        key: 'id',
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('user_alerts', 'agent_id');
  },
};
