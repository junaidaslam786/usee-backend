module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('appointment_tokens', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      appointmentId: {
        field: 'appointment_id',
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'appointments',
          key: 'id'
        }
      },
      userId: {
        field: 'user_id',
        type: Sequelize.UUID,
        onDelete: 'CASCADE',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      token: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('appointment_tokens');
  }
};
