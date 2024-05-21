/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('user_subscriptions', 'id', {
      type: Sequelize.UUID,
      primaryKey: true,
      unique: true,
      defaultValue: Sequelize.UUIDV4,
      allowNull: true,
    });

    // Update existing rows to set a non-null value for the new column
    await queryInterface.sequelize.query('UPDATE user_subscriptions SET id = gen_random_uuid() WHERE id IS NULL;');

    // Add a not-null constraint to the column
    await queryInterface.changeColumn('user_subscriptions', 'id', {
      allowNull: false,
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('user_subscriptions', 'id');
  },
};
