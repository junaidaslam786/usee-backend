export const up = (queryInterface, Sequelize) => queryInterface.createTable('appointment_notes', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  customerId: {
    field: 'customer_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: true,
  },
  agentId: {
    field: 'agent_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id',
    },
    allowNull: true,
  },
  appointmentId: {
    field: 'appointment_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'appointments',
      key: 'id',
    },
  },
  notes: {
    type: Sequelize.TEXT,
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('appointment_notes');
