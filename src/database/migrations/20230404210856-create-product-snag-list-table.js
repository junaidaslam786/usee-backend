export const up = (queryInterface, Sequelize) => queryInterface.createTable('product_snag_list', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  offerId: {
    field: 'offer_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'product_offers',
      key: 'id'
    }
  },
  agentApproved: {
    type: Sequelize.BOOLEAN,
    field: 'agent_approved',
  },
  customerApproved: {
    type: Sequelize.BOOLEAN,
    field: 'customer_approved',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  }
});

export const down = (queryInterface) => queryInterface.dropTable('product_snag_list');
