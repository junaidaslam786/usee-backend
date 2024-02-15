export const up = (queryInterface, Sequelize) => queryInterface.createTable('user_call_background_images', {
  id: {
    type: Sequelize.INTEGER,
    field: 'id',
    primaryKey: true,
    unique: true,
    allowNull: false,
    autoIncrement: true,
  },
  userId: {
    field: 'user_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id',
    },
  },
  name: {
    type: Sequelize.TEXT,
    field: 'name',
  },
  url: {
    type: Sequelize.STRING,
    field: 'url',
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

export const down = (queryInterface) => queryInterface.dropTable('user_call_background_images');
