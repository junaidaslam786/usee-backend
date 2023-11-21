'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tokens', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      userId: {
        field: 'user_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      totalAmount: {
        field: 'total_amount',
        type: Sequelize.INTEGER,
        allowNull: false
      },
      remainingAmount: {
        field: 'remaining_amount',
        type: Sequelize.INTEGER,
        allowNull: false
      },
      acquiredDate: {
        field: 'acquired_date',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      stripeInvoiceId: {
        field: 'stripe_invoice_id',
        type: Sequelize.STRING,
        allowNull: true
      },
      stripeInvoiceStatus: {
        field: 'stripe_invoice_status',
        type: Sequelize.ENUM('draft', 'open', 'void', 'paid', 'uncollectible')
      },
      valid: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tokens');
  }
};
