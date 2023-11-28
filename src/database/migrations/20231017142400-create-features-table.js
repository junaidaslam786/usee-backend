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
      totalUnits: {
        field: 'total_units',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      freeUnits: {
        field: 'free_units',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      unitName: {
        field: 'unit_name',
        type: Sequelize.STRING,
        allowNull: false,
      },
      unitType: {
        field: 'unit_type',
        type: Sequelize.ENUM,
        defaultValue: "number",
        values: ["number", "minute", "hour", "day", "week", "month"]
      },
      featureType: {
        field: 'feature_type',
        type: Sequelize.ENUM,
        defaultValue: "feature",
        values: ["feature", "addon"]
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
