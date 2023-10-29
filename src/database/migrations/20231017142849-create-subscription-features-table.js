'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscription_features', {
      featureId: {
        field: 'feature_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'features',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      subscriptionId: {
        field: 'subscription_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscriptions',  // Assuming your subscription table is named 'subscriptions'
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
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
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscription_features');
  }
};
