/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('features', 'order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    const desiredOrder = {
      'Property Listing': 1,
      'Video Call': 2,
      'Snag List': 3,
      'Video Call Recording': 4,
      'Carbon Footprint': 5,
      'Analytics & Reporting': 6,
      'API Subscription': 7,
    };

    const updatePromises = [];
    Object.entries(desiredOrder).forEach(([featureName, order]) => {
      updatePromises.push(
        queryInterface.bulkUpdate('features', { order }, { name: featureName }),
      );
    });
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('features', 'order');
  }
};
