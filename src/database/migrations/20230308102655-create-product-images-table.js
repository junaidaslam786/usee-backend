export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_images', {
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
  image: {
    type: Sequelize.STRING,
    field: 'image',
  },
  sortOrder: {
    type: Sequelize.INTEGER,
    field: 'sort_order',
  },
  createdBy: {
    allowNull: true,
    type: Sequelize.UUID,
    field: 'created_by',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('product_images');
