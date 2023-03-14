'use strict';

import { hash } from 'bcrypt';

module.exports = {
  async up (queryInterface, Sequelize) {
    const users = [
      {
        id: "357a2066-8943-4b46-ab51-d557a24c16fb",
        first_name: "Super",
        last_name: "Admin",
        email: "admin@admin.com",
        password: await hash("12345678", 10),
        status: true,
        user_type: "admin",
        role_id: 1,
      },
    ];
    await queryInterface.bulkInsert('users', users);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
