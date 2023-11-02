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
        // allowNull: false,
      },
      dailyTokenLimit: {
        field: 'daily_token_limit',
        type: Sequelize.INTEGER
      },
      totalUnits: {
        field: 'total_units',
        type: Sequelize.FLOAT,
        // allowNull: false,
      },
      maxPurchaseLimit: {
        field: 'max_purchase_limit',
        type: Sequelize.FLOAT,
        // allowNull: false,
      },
      featureType: {
        field: 'feature_type',
        type: Sequelize.ENUM,
        defaultValue: "feature",
        values: ["feature", "addon"]
      },
      stripeProductId: {
        field: 'stripe_product_id',
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
    await queryInterface.dropTable('features');
  }
};
