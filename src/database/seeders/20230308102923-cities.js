'use strict';

const citiesData = require("./data/cities");

module.exports = {
  async up (queryInterface, Sequelize) {
    if (citiesData) {
      await queryInterface.bulkInsert('cities', citiesData);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('cities', null, {});
  }
};
