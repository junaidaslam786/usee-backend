/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('subscription_features', [{
      subscription_id: '35e0b998-53bc-4777-a207-261fff3489aa',
      feature_id: '159c869a-1b24-4cd3-ac61-425645b730c7',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      subscription_id: '35e0b998-53bc-4777-a207-261fff3489aa',
      feature_id: '989d96e5-e839-4fe2-8f3e-bb6a5b2d30a2',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      subscription_id: '35e0b998-53bc-4777-a207-261fff3489aa',
      feature_id: '3ae5fd58-6cca-4e51-b368-1a3a310d99fc',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      subscription_id: '35e0b998-53bc-4777-a207-261fff3489aa',
      feature_id: '02d5274e-0739-4032-87fa-620211a31700',
      created_at: new Date(),
      updated_at: new Date(),
    }], {});
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('features', null, {});
  },
};
