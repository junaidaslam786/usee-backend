module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('products', 'geometry', {
      type: Sequelize.GEOMETRY('POINT'),
      allowNull: true,
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('products', 'geometry');
  },
};
