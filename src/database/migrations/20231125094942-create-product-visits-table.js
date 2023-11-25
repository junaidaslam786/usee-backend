'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('product_visits', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      productId: {
        field: 'product_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        }
      },
      agentId: {
        field: 'agent_id',
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      customerId: {
        field: 'customer_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      distance: {
        type: Sequelize.FLOAT,
        allowNull: false
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
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        field: 'deleted_at',
        defaultValue: null
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('product_visits');
  }
};
