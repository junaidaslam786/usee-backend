module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointments', {
      id: {
        type: Sequelize.UUID,
        field: 'id',
        primaryKey: true,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
      },
      agentId: {
        field: 'agent_id',
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      customerId: {
        field: 'customer_id',
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      allotedAgent: {
        field: 'alloted_agent',
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      appointmentDate: {
        field: 'appointment_date',
        allowNull: false,
        type: Sequelize.DATE,
      },
      appointmentTime: {
        field: 'appointment_time',
        allowNull: false,
        type: Sequelize.TIME,
      },
      customerPhoneNumber: {
        type: Sequelize.STRING,
        field: 'customer_phonenumber',
      },
      sessionId: {
        type: Sequelize.STRING,
        field: 'session_id',
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE,
        field: 'deleted_at',
        defaultValue: null,
      },
    });
  },
  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointments');
  },
};
