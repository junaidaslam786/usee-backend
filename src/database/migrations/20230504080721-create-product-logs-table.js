export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_logs', {
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
  productId: {
    field: 'product_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'products',
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
  reason: {
    type: Sequelize.TEXT,
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('product_logs');
