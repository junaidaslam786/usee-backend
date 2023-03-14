export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_remove_request', {
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
  productId: {
    field: 'product_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'products',
      key: 'id'
    }
  },
  removeReasonId: {
    field: 'remove_reason_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'product_remove_reasons',
      key: 'id'
    }
  },
  reason: {
    type: Sequelize.TEXT,
    field: 'reason'
  },
  status: {
    type: Sequelize.BOOLEAN,
    field: 'status'
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

export const down = (queryInterface) => queryInterface.dropTable('product_remove_request');
