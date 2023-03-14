'use strict';

const countriesData = require("./data/countries");
// const { v4: uuid } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    if (countriesData) {
      await queryInterface.bulkInsert('countries', countriesData);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('countries', null, {});
  }
};
