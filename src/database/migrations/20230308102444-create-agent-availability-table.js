export const up = (queryInterface, Sequelize) => queryInterface.createTable('agent_availability', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  userId: {
    field: 'user_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  dayId: {
    type: Sequelize.INTEGER,
    field: 'day_id',
  },
  timeSlotId: {
    field: 'time_slot_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'agent_time_slots',
      key: 'id'
    }
  },
  status: {
    type: Sequelize.BOOLEAN,
    field: 'status',
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

export const down = (queryInterface) => queryInterface.dropTable('agent_availability');
