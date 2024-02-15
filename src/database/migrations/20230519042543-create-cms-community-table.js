export const up = (queryInterface, Sequelize) => queryInterface.createTable('cms_community', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
  },
  categoryId: {
    field: 'category_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  title: {
    type: Sequelize.TEXT,
    field: 'title',
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    field: 'status',
    defaultValue: true,
  },
  createdBy: {
    type: Sequelize.UUID,
    field: 'created_by',
    allowNull: true,
  },
  updatedBy: {
    type: Sequelize.UUID,
    field: 'updated_by',
    allowNull: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  deletedAt: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'deleted_at',
    defaultValue: null,
  },
});

export const down = (queryInterface) => queryInterface.dropTable('cms_community');
