'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('token_transactions', {
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
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
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
    await queryInterface.dropTable('token_transactions');
  }
};
