export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_meta_tags', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4
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
  key: {
    field: 'key',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'category_fields',
      key: 'id'
    }
  },
  value: {
    type: Sequelize.STRING,
    field: 'value',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

export const down = (queryInterface) => queryInterface.dropTable('product_meta_tags');
