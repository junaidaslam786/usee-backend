'use strict';

const agentTimeSlotsData = require("./data/agents_time_slots");

module.exports = {
  async up (queryInterface, Sequelize) {
    if (agentTimeSlotsData) {
      await queryInterface.bulkInsert('agent_time_slots', agentTimeSlotsData);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('agent_time_slots', null, {});
  }
};
