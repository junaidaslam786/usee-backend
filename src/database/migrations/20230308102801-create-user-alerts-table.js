export const up = (queryInterface, Sequelize) => queryInterface.createTable('user_alerts', {
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
      key: 'id'
    }
  },
  productId: {
    field: 'product_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  alertMode: {
    field: 'alert_mode',
    type: Sequelize.STRING,
  },
  alertType: {
    field: 'alert_type',
    type: Sequelize.INTEGER,
  },
  removed: {
    type: Sequelize.BOOLEAN,
    field: 'removed'
  },
  viewed: {
    type: Sequelize.BOOLEAN,
    field: 'viewed'
  },
  emailed: {
    type: Sequelize.BOOLEAN,
    field: 'emailed'
  },
  createdBy: {
    allowNull: true,
    type:Sequelize.UUID,
    field: 'created_by'
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

export const down = (queryInterface) => queryInterface.dropTable('user_alerts');
