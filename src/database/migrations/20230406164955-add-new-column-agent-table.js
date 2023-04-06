module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('agents', 'job_title', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });

    await queryInterface.addColumn('agents', 'license_no', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('agents', 'reject_reason');
  }
};
