'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const categoryFields = [
        {
          id: 9,
          category_id: 1,
          label: "Deed Title",
          type: "text",
          options: "",
          required: false,
          order: 9,
        },
      ];
      await queryInterface.bulkInsert('category_fields', categoryFields);
    } catch(error) {
      console.log('error', error);
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('category_fields', { id: 9 });
  }
};
