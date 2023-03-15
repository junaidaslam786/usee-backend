export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_allocations', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4
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

export const down = (queryInterface) => queryInterface.dropTable('product_allocations');
