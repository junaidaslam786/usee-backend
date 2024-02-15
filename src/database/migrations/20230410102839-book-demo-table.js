export const up = (queryInterface, Sequelize) => queryInterface.createTable('book_demo', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  name: {
    type: Sequelize.STRING,
  },
  email: {
    type: Sequelize.STRING,
  },
  jobTitle: {
    type: Sequelize.STRING,
    field: 'job_title',
  },
  phoneNumber: {
    type: Sequelize.STRING,
    field: 'phone_number',
  },
  message: {
    type: Sequelize.TEXT,
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('book_demo');
