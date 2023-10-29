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
      acquiredDate: {
        field: 'acquired_date',
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      featureId: {
        field: 'feature_id',
        type: Sequelize.UUID,
        references: {
          model: 'features',
          key: 'id'
        }
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tokens');
  }
};
