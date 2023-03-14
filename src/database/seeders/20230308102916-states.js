'use strict';

const statesData = require("./data/states");

module.exports = {
  async up (queryInterface, Sequelize) {
    if (statesData) {
      await queryInterface.bulkInsert('states', statesData);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states', null, {});
  }
};
