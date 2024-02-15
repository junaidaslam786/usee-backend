export const up = (queryInterface, Sequelize) => queryInterface.createTable('appointment_logs', {
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
      key: 'id',
    },
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
  userType: {
    type: Sequelize.STRING,
    field: 'user_type',
  },
  logType: {
    type: Sequelize.STRING,
    field: 'log_type',
  },
  addedAt: {
    type: Sequelize.STRING,
    field: 'added_at',
  },
  reason: {
    type: Sequelize.TEXT,
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('appointment_logs');
