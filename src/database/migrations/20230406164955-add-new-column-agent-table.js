module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('agents', 'job_title', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    });

    await queryInterface.addColumn('agents', 'license_no', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: '',
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('agents', 'job_title');
    await queryInterface.removeColumn('agents', 'license_no');
  },
};
