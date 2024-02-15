/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'country', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('products', 'permit_number', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('products', 'qr_code', {
      type: Sequelize.STRING,
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'country');
    await queryInterface.removeColumn('products', 'permit_number');
    await queryInterface.removeColumn('products', 'qr_code');
  },
};
