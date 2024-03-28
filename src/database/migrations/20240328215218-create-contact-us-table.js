/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contact_us', {
      id: {
        type: Sequelize.INTEGER,
        field: 'id',
        primaryKey: true,
        unique: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      subject: {
        type: Sequelize.STRING,
      },
      jobTitle: {
        type: Sequelize.STRING,
        field: 'job_title',
      },
      phoneNumber: {
        type: Sequelize.STRING,
        field: 'phone_number',
      },
      message: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contact_us');
  },
};
