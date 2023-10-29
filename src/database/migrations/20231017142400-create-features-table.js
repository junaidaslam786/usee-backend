'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('features', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
      },
      tokensPerUnit: {
        field: 'tokens_per_unit',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      dailyTokenLimit: {
        field: 'daily_token_limit',
        type: Sequelize.INTEGER
      },
      totalUnits: {
        field: 'total_units',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      maxPurchaseLimit: {
        field: 'max_purchase_limit',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      featureType: {
        field: 'feature_type',
        type: Sequelize.FLOAT,
        allowNull: false,
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
    await queryInterface.dropTable('features');
  }
};
