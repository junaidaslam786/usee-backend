'use strict';


module.exports = {
  async up (queryInterface, Sequelize) {
    const role = [
      {
        id: 1,
        name: 'SuperAdmin',
        description: 'This will have all permissions'
      },
    ];
    await queryInterface.bulkInsert('roles', role);


    const rolePermissions = [
      {
        role_id: 1,
        permission_id: 1
      },
      {
        role_id: 1,
        permission_id: 2
      },
      {
        role_id: 1,
        permission_id: 3
      },
      {
        role_id: 1,
        permission_id: 4
      },
      {
        role_id: 1,
        permission_id: 5
      },
      {
        role_id: 1,
        permission_id: 6
      },
    ];
    await queryInterface.bulkInsert('role_permissions', rolePermissions);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {});
    await queryInterface.bulkDelete('role_permissions', null, {});
  }
};
