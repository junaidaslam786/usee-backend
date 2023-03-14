export const up = (queryInterface, Sequelize) => queryInterface.createTable('roles', {
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
    field: 'name',
    allowNull: false
  },
  description:{
    type: Sequelize.TEXT,
    field: 'description'
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

export const down = (queryInterface) => queryInterface.dropTable('roles');
