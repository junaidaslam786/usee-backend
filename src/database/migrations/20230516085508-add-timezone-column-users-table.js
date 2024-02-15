module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'timezone', {
      type: Sequelize.STRING,
      defaultValue: 'Asia/Dubai',
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'timezone');
  },
};
