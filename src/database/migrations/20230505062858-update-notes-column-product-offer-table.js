module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('product_offers', 'notes', {
      type: Sequelize.TEXT,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('product_offers', 'notes', {
      type: Sequelize.STRING,
    });
  },
};
