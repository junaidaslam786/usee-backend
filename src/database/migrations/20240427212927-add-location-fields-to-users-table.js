/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'latitude', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'longitude', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('users', 'geometry', {
      type: Sequelize.GEOMETRY('POINT'),
      allowNull: true,
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'latitude');
    await queryInterface.removeColumn('users', 'longitude');
    await queryInterface.removeColumn('users', 'geometry');
  },
};
