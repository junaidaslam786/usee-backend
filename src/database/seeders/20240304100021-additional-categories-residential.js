module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const categoryFields = [];

      // Residential Property Specific Features
      // Apartments
      categoryFields.push({
        id: 48,
        category_id: 1,
        label: 'Building Amenities',
        type: 'checkbox',
        options: 'Pool,Gym,Laundry Facility',
        required: false,
        order: 48,
      });

      // House
      categoryFields.push({
        id: 49,
        category_id: 1,
        label: 'Fireplace',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 49,
      });
      categoryFields.push({
        id: 50,
        category_id: 1,
        label: 'Fireplace Value',
        type: 'text',
        options: 'Wood Burning,Gas',
        required: false,
        order: 50,
      });
      categoryFields.push({
        id: 51,
        category_id: 1,
        label: 'Number of Floors',
        type: 'text',
        options: '',
        required: false,
        order: 51,
      });
      categoryFields.push({
        id: 52,
        category_id: 1,
        label: 'Basement',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 52,
      });

      // Residential Properties Common Features
      categoryFields.push({
        id: 53,
        category_id: 1,
        label: 'Parking',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 53,
      });
      // if Parking yes
      categoryFields.push({
        id: 54,
        category_id: 1,
        label: 'Parking Option',
        type: 'select',
        options: 'Garage,Carport,Street Parking',
        required: false,
        order: 54,
      });
      //  if Parking Option = Garage/Carport
      categoryFields.push({
        id: 55,
        category_id: 1,
        label: 'Garage/Carport(No. of Spaces)',
        type: 'text',
        options: '',
        required: false,
        order: 55,
      });
      categoryFields.push({
        id: 56,
        category_id: 1,
        label: 'Outdoor Spaces',
        type: 'checkbox',
        options: 'Garden,Balcony,Outdoor Area,Swimming Pool,Patio',
        required: false,
        order: 56,
      });
      categoryFields.push({
        id: 57,
        category_id: 1,
        label: 'Number of Bathrooms',
        type: 'text',
        options: '',
        required: false,
        order: 57,
      });
      categoryFields.push({
        id: 58,
        category_id: 1,
        label: 'Furnished',
        type: 'select',
        options: 'Yes,No,Partially Furnished',
        required: false,
        order: 58,
      });

      await queryInterface.bulkInsert('category_fields', categoryFields);
    } catch (error) {
      console.error('Error seeding category fields:', error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Delete category fields
      await queryInterface.bulkDelete('category_fields', {
        id: {
          [Sequelize.Op.in]: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58],
        },
      });
    } catch (error) {
      console.error('Error reverting category fields seed:', error);
    }
  },
};
