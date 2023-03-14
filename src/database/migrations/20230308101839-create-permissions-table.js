export const up = (queryInterface, Sequelize) => queryInterface.createTable('permissions', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  key: {
    type: Sequelize.STRING,
    allowNull: false
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
      type: Sequelize.DATE,
      field: 'updated_at',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  deletedAt: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'deleted_at',
    defaultValue: null
  }
});

export const down = (queryInterface) => queryInterface.dropTable('permissions');
