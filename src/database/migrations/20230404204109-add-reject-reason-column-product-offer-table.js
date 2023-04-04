module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('product_offers', 'reject_reason', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('product_offers', 'reject_reason');
  }
};
