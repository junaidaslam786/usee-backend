'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('subscription_features', {
      featureId: {
        type: Sequelize.UUID,
        primaryKey: true,
        field: 'feature_id',
        allowNull: false,
        references: {
          model: 'features',
          key: 'id'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      subscriptionId: {
        type: Sequelize.UUID,
        primaryKey: true,
        field: 'subscription_id',
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

    // Add unique constraint to featureId and subscriptionId columns
    await queryInterface.addConstraint('subscription_features', {
      fields: ['feature_id', 'subscription_id'],
      type: 'unique',
      name: 'unique_feature_subscription'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('subscription_features');
  }
};
