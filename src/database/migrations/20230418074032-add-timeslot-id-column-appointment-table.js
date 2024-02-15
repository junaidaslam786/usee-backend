module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('appointments', 'appointment_time');
    await queryInterface.removeColumn('appointments', 'appointment_date');

    await queryInterface.addColumn('appointments', 'appointment_date', {
      type: Sequelize.DATEONLY,
    });

    await queryInterface.addColumn('appointments', 'time_slot_id', {
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'agent_time_slots',
        key: 'id',
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('appointments', 'appointment_time', {
      type: Sequelize.TIME,
      allowNull: false,
    });
    await queryInterface.addColumn('appointments', 'appointment_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
    await queryInterface.removeColumn('appointments', 'time_slot_id');
  },
};
