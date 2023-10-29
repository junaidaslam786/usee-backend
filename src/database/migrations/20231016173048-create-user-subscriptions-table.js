'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_subscriptions', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: Sequelize.UUIDV4
      },
      userId: {
        field: 'user_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      subscriptionId: {
        field: 'subscription_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id',
        },
        onDelete: 'CASCADE'
      },
      startDate: {
        field: 'start_date',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      endDate: {
        field: 'end_date',
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      stripeSubscriptionId: {
        field: 'stripe_subscription_id',
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_subscriptions');
  }
};

