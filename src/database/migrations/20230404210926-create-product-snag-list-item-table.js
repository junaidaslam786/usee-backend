export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_snag_list_items', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  snagListId: {
    field: 'snag_list_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'product_snag_list',
      key: 'id',
    },
  },
  snagKey: {
    type: Sequelize.STRING,
    field: 'snag_key',
  },
  snagValue: {
    type: Sequelize.BOOLEAN,
    field: 'snag_value',
  },
  customerComment: {
    type: Sequelize.TEXT,
    field: 'customer_comment',
  },
  agentComment: {
    type: Sequelize.TEXT,
    field: 'agent_comment',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('product_snag_list_items');
