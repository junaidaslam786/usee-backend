export const up = (queryInterface, Sequelize) => queryInterface.createTable('cities', {
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
  },
  stateId: {
    field: 'state_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'states',
      key: 'id'
    }
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
  }
});

export const down = (queryInterface) => queryInterface.dropTable('cities');
