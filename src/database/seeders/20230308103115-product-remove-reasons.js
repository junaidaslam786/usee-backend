'use strict';


module.exports = {
  async up (queryInterface, Sequelize) {
    const permissions = [
      {
        id: 1,
        reason: "Sold"
      },
      {
        id: 2,
        reason: "Other"
      }
    ];
    await queryInterface.bulkInsert('product_remove_reasons', permissions);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_remove_reasons', null, {});
  }
};
