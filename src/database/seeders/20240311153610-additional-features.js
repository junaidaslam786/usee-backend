'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('features', [{
      id: 'b4d0b1f8-4473-4f1b-9f9b-4f4e12c8a8e8',
      name: 'Video Call Recording',
      description: 'Enable recording feature for video calls.',
      tokens_per_unit: 0.0,
      total_units: 0.0,
      free_units: 0.0,
      unit_name: 'call_recording',
      unit_type: 'file',
      feature_type: 'addon',
    },
    {
      id: 'e8277dfc-891f-4489-9943-4b2b2616b9f7',
      name: 'Snag List',
      description: 'Manage and track snag lists for properties.',
      tokens_per_unit: 0.0,
      total_units: 0.0,
      free_units: 0.0,
      unit_name: 'snag_list',
      unit_type: 'number',
      feature_type: 'addon',
    }], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('features', {
      id: {
        [Sequelize.Op.in]: [
          'b4d0b1f8-4473-4f1b-9f9b-4f4e12c8a8e8',
          'e8277dfc-891f-4489-9943-4b2b2616b9f7',
        ],
      },
    });
  },
};
