export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_offers', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
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
  customerId: {
    field: 'customer_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  amount: {
    type: Sequelize.STRING,
    field: 'amount',
    allowNull: false,
  },
  notes: {
    type: Sequelize.STRING,
    field: 'notes',
  },
  status: {
    field: 'status',
    type: Sequelize.ENUM,
    defaultValue: 'pending',
    values: ['pending', 'accepted', 'rejected'],
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('product_offers');
