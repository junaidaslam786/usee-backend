/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user_subscriptions', {
      userId: {
        primaryKey: true,
        field: 'user_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      subscriptionId: {
        primaryKey: true,
        field: 'subscription_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      featureId: {
        primaryKey: true,
        field: 'feature_id',
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'features',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      freeRemainingUnits: {
        field: 'free_remaining_units',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      paidRemainingUnits: {
        field: 'paid_remaining_units',
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      autoRenew: {
        field: 'auto_renew',
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      autoRenewUnits: {
        field: 'auto_renew_units',
        type: Sequelize.FLOAT,
        defaultValue: 0,
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
        type: Sequelize.ENUM('active', 'cancelled', 'expired'),
        allowNull: false,
      },
      createdAt: {
        field: 'created_at',
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        field: 'updated_at',
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_subscriptions');
  },
};
