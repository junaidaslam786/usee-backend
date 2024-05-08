/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('appointments', 'scheduled_job_agent', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('appointments', 'scheduled_job_customer', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('appointments', 'scheduled_job_agent');
    await queryInterface.removeColumn('appointments', 'scheduled_job_customer');
  },
};
