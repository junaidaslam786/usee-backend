module.exports = {
  async up (queryInterface, Sequelize) {
    // step 1: Create new column for city name
    await queryInterface.addColumn('users', 'city_name', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    });

    await queryInterface.sequelize.query(`
      update users set city_name = (
        select name from cities where cities.id = users.city_id
      )
    `);

    await queryInterface.removeColumn('users', 'city_id');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'city_id', {
      allowNull: true,
      type: Sequelize.INTEGER,
      onDelete: 'CASCADE',
      references: {
        model: 'cities',
        key: 'id'
      }
    });

    await queryInterface.sequelize.query(`
      update users set city_id = (
        select id from cities where cities.name = users.city_name
      )
    `); 

    await queryInterface.removeColumn('users', 'city_name');
  }
};
