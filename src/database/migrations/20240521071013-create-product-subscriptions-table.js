/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_subscriptions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userSubscriptionId: {
        type: Sequelize.UUID,
        references: {
          model: 'user_subscriptions',
          key: 'id',
        },
        allowNull: false,
        field: 'user_subscription_id',
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'products',
          key: 'id',
        },
        allowNull: false,
        field: 'product_id',
      },
      freeRemainingUnits: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        field: 'free_remaining_units',
      },
      paidRemainingUnits: {
        type: Sequelize.FLOAT,
        defaultValue: 0,
        field: 'paid_remaining_units',
      },
      videoCallsMissed: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        field: 'video_calls_missed',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at',
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_subscriptions');
  },
};
