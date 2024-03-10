module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const categoryFields = [];

      // Commercial Property Specific Features
      // Office
      categoryFields.push({
        id: 10,
        category_id: 1,
        label: 'Layout',
        type: 'select',
        options: 'Open Plan,Private Offices,Mixed',
        required: false,
        order: 10,
      });
      categoryFields.push({
        id: 11,
        category_id: 1,
        label: 'Conference Room',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 11,
      });
      // if Conference Room yes
      categoryFields.push({
        id: 12,
        category_id: 1,
        label: 'Conference Room Capacity',
        type: 'text',
        options: '',
        required: false,
        order: 12,
      });
      categoryFields.push({
        id: 13,
        category_id: 1,
        label: 'Kitchen',
        type: 'select',
        options: 'Full Kitchen,Kitchenette,No Kitchen',
        required: false,
        order: 13,
      });

      // Retail
      categoryFields.push({
        id: 14,
        category_id: 1,
        label: 'Area of Display Window',
        type: 'text',
        options: '',
        required: false,
        order: 14,
      });
      categoryFields.push({
        id: 15,
        category_id: 1,
        label: 'Display Window Type',
        type: 'select',
        options: 'Full Height,Storefront,Corner,Other',
        required: false,
        order: 15,
      });
      // if Display Window Type = Other
      categoryFields.push({
        id: 16,
        category_id: 1,
        label: 'Display Window Type Value(Other)',
        type: 'text',
        options: '',
        required: false,
        order: 16,
      });

      // Shopping Center
      categoryFields.push({
        id: 17,
        category_id: 1,
        label: 'Number of Stores',
        type: 'text',
        options: '',
        required: false,
        order: 17,
      });
      categoryFields.push({
        id: 18,
        category_id: 1,
        label: 'Food Court',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 18,
      });
      categoryFields.push({
        id: 19,
        category_id: 1,
        label: 'Rest Rooms',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 19,
      });

      // Hotel
      categoryFields.push({
        id: 20,
        category_id: 1,
        label: 'Number Of Pools',
        type: 'text',
        options: '',
        required: false,
        order: 20,
      });
      categoryFields.push({
        id: 21,
        category_id: 1,
        label: 'Pool Types',
        type: 'checkbox',
        options: 'Indoor,Outdoor',
        required: false,
        order: 21,
      });
      categoryFields.push({
        id: 22,
        category_id: 1,
        label: 'Number of Rooms',
        type: 'text',
        options: '',
        required: false,
        order: 22,
      });

      // Club
      categoryFields.push({
        id: 23,
        category_id: 1,
        label: 'Area of Bar(m²)',
        type: 'text',
        options: '',
        required: false,
        order: 23,
      });
      categoryFields.push({
        id: 24,
        category_id: 1,
        label: 'Area of Lounge(m²)',
        type: 'text',
        options: '',
        required: false,
        order: 24,
      });
      categoryFields.push({
        id: 25,
        category_id: 1,
        label: 'Capacity of VIP Section',
        type: 'text',
        options: '',
        required: false,
        order: 25,
      });
      categoryFields.push({
        id: 26,
        category_id: 1,
        label: 'Number of Dance Floors',
        type: 'text',
        options: '',
        required: false,
        order: 26,
      });
      categoryFields.push({
        id: 27,
        category_id: 1,
        label: 'Number of Private Rooms',
        type: 'text',
        options: '',
        required: false,
        order: 27,
      });

      // Restaurant
      categoryFields.push({
        id: 28,
        category_id: 1,
        label: 'Area of Kitchen',
        type: 'text',
        options: '',
        required: false,
        order: 28,
      });
      categoryFields.push({
        id: 29,
        category_id: 1,
        label: 'Outdoor Seating',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 29,
      });
      // if Outdoor Seating yes
      categoryFields.push({
        id: 30,
        category_id: 1,
        label: 'Area of Outdoor Seating(m²)',
        type: 'text',
        options: '',
        required: false,
        order: 30,
      });

      // Hotel Room
      categoryFields.push({
        id: 31,
        category_id: 1,
        label: 'Room Size(m²)',
        type: 'text',
        options: '',
        required: false,
        order: 31,
      });
      categoryFields.push({
        id: 32,
        category_id: 1,
        label: 'Number of Beds',
        type: 'text',
        options: '',
        required: false,
        order: 32,
      });
      categoryFields.push({
        id: 33,
        category_id: 1,
        label: 'Room Type',
        type: 'select',
        options: 'Single Room,Studio,Deluxe Room,Double Room,Queen Room,Suite,Connecting Room,Penthouse Suite',
        required: false,
        order: 33,
      });
      categoryFields.push({
        id: 34,
        category_id: 1,
        label: 'Floor Level',
        type: 'text',
        options: '',
        required: false,
        order: 34,
      });
      categoryFields.push({
        id: 35,
        category_id: 1,
        label: 'View',
        type: 'select',
        options: 'City View,Ocean View,Garden View,Pool View,Mountain View',
        required: false,
        order: 35,
      });
      categoryFields.push({
        id: 36,
        category_id: 1,
        label: 'Balcony/Terrace',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 36,
      });

      // Commercial Property Common Features
      categoryFields.push({
        id: 37,
        category_id: 1,
        label: 'Security Features',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 37,
      });
      // if Security Features yes
      categoryFields.push({
        id: 38,
        category_id: 1,
        label: 'Security Features Value',
        type: 'checkbox',
        options: 'Alarms,Cameras',
        required: false,
        order: 38,
      });
      categoryFields.push({
        id: 39,
        category_id: 1,
        label: 'Disability Access',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 39,
      });
      categoryFields.push({
        id: 40,
        category_id: 1,
        label: 'Parking Facility',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 40,
      });
      // if Parking Facility yes
      categoryFields.push({
        id: 41,
        category_id: 1,
        label: 'Parking Facility (Number of Spaces)',
        type: 'text',
        options: '',
        required: false,
        order: 41,
      });
      categoryFields.push({
        id: 42,
        category_id: 1,
        label: 'Public Transport Access',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 42,
      });
      categoryFields.push({
        id: 43,
        category_id: 1,
        label: 'Year Built',
        type: 'text',
        options: '',
        required: false,
        order: 43,
      });
      categoryFields.push({
        id: 44,
        category_id: 1,
        label: 'Condition',
        type: 'select',
        options: 'New,Needs Renovation',
        required: false,
        order: 44,
      });
      categoryFields.push({
        id: 45,
        category_id: 1,
        label: 'Availability Date',
        type: 'text',
        options: '',
        required: false,
        order: 45,
      });
      categoryFields.push({
        id: 46,
        category_id: 1,
        label: 'Pet Friendliness',
        type: 'radio',
        options: 'yes,no',
        required: false,
        order: 46,
      });
      categoryFields.push({
        id: 47,
        category_id: 1,
        label: 'Additional Features',
        type: 'textarea',
        options: '',
        required: false,
        order: 47,
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
          [Sequelize.Op.in]: [
            10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
            24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38,
            39, 40, 41, 42, 43, 44, 45, 46, 47,
          ],
        },
      });
    } catch (error) {
      console.error('Error reverting category fields seed:', error);
    }
  },
};
