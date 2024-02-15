export const up = (queryInterface, Sequelize) => queryInterface.createTable('user_logs', {
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
  subject: {
    type: Sequelize.TEXT,
    field: 'subject',
  },
  url: {
    type: Sequelize.STRING,
    field: 'url',
  },
  method: {
    type: Sequelize.STRING,
    field: 'method',
  },
  ipAddress: {
    type: Sequelize.STRING,
    field: 'ip_address',
  },
  browser: {
    type: Sequelize.TEXT,
    field: 'browser',
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

export const down = (queryInterface) => queryInterface.dropTable('user_logs');
