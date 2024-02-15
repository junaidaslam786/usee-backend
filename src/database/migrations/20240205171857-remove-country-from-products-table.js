/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'country');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'country', {
      type: Sequelize.STRING,
    });
  },
};
