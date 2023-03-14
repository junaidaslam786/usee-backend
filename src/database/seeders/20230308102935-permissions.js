'use strict';


module.exports = {
  async up (queryInterface, Sequelize) {
    const permissions = [
      {
        id: 1,
        name: "Property",
        key: "property"
      },
      {
        id: 2,
        name: "Appointment",
        key: "appointment"
      },
      {
        id: 3,
        name: "Customer",
        key: "customer"
      },
      {
        id: 4,
        name: "Agent",
        key: "agent"
      },
      {
        id: 5,
        name: "User",
        key: "user"
      },
      {
        id: 6,
        name: "Role",
        key: "role"
      }
    ];
    await queryInterface.bulkInsert('permissions', permissions);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};
