export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_documents', {
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
  title: {
    type: Sequelize.STRING,
    field: 'title',
    allowNull: false
  },
  file: {
    type: Sequelize.STRING,
    field: 'file',
  },
  createdBy: {
    allowNull: true,
    type:Sequelize.UUID,
    field: 'created_by'
  },
  updatedBy: {
    allowNull: true,
    type:Sequelize.UUID,
    field: 'updated_by'
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
});

export const down = (queryInterface) => queryInterface.dropTable('product_documents');
