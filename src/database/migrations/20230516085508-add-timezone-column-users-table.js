module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'timezone', {
      type: Sequelize.STRING,
      defaultValue: 'Asia/Dubai'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'timezone');
  }
};
