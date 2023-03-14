export const up = (queryInterface, Sequelize) => queryInterface.createTable('role_permissions', {
  roleId: {
    field: 'role_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  permissionId: {
    field: 'permission_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'permissions',
      key: 'id'
    }
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

export const down = (queryInterface) => queryInterface.dropTable('role_permissions');
