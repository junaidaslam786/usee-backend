export const up = (queryInterface, Sequelize) => queryInterface.createTable('agent_time_slots', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  fromTime: {
    type: Sequelize.TIME,
    field: 'from_time',
  },
  toTime: {
    type: Sequelize.TIME,
    field: 'to_time',
  },
  textShow: {
    type: Sequelize.STRING,
    field: 'text_show',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('agent_time_slots');
