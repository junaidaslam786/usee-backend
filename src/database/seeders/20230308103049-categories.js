'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const categories = [
        {
          id: 1,
          name: 'Property',
        },
      ];
      await queryInterface.bulkInsert('categories', categories);

      const categoryFields = [
        {
          id: 1,
          category_id: 1,
          label: 'Property Type',
          type: 'select',
          options: 'commercial,residential',
          required: true,
          order: 1,
        },
        {
          id: 2,
          category_id: 1,
          label: 'Property Category Type',
          type: 'select',
          options: 'rent,sale',
          required: true,
          order: 2,
        },
        {
          id: 3,
          category_id: 1,
          label: 'Unit',
          type: 'select',
          options: 'sq_ft,sq_mt',
          required: false,
          order: 3,
        },
        {
          id: 4,
          category_id: 1,
          label: 'Area',
          type: 'text',
          options: '',
          required: false,
          order: 4,
        },
        {
          id: 5,
          category_id: 1,
          label: 'No. of bedrooms',
          type: 'select',
          options: '1,2,3,4,5,6,7,8,9,10',
          required: false,
          order: 5,
        },
        {
          id: 6,
          category_id: 1,
          label: 'Residential Property Type',
          type: 'select',
          options: 'apartment,house,bungalow,studio,room,duplex,triplex,cottage',
          required: false,
          order: 6,
        },
        {
          id: 7,
          category_id: 1,
          label: 'Commercial Property Type',
          type: 'select',
          options: 'office,retail,shop,shopping_center,store,hotels,club,restaurant,hotel_room',
          required: false,
          order: 7,
        },
        {
          id: 8,
          category_id: 1,
          label: 'Price Type',
          type: 'select',
          options: 'weekly,monthly,yearly',
          required: false,
          order: 8,
        },
      ];
      await queryInterface.bulkInsert('category_fields', categoryFields);
    } catch (error) {
      console.log('error', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('category_fields', null, {});
  },
};
