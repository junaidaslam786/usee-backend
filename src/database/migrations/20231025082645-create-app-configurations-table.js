'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('app_configurations', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      configKey: {
        field: 'config_key',
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      configValue: {
        field: 'config_value',
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
      },
      stripeProductId: {
        field: 'stripe_product_id',
        type: Sequelize.STRING,
      },
      stripePriceId: {
        field: 'stripe_price_id',
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('app_configurations');
  },
};
