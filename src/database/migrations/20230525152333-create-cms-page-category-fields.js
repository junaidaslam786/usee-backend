export const up = (queryInterface, Sequelize) => queryInterface.createTable('cms_page_category_fields', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
  },
  pageId: {
    type: Sequelize.UUID,
    field: 'page_id',
    onDelete: 'CASCADE',
    references: {
      model: 'cms_pages',
      key: 'id',
    },
  },
  key: {
    type: Sequelize.INTEGER,
    field: 'key',
    onDelete: 'CASCADE',
    references: {
      model: 'category_fields',
      key: 'id',
    },
  },
  value: {
    type: Sequelize.STRING,
    field: 'value',
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

export const down = (queryInterface) => queryInterface.dropTable('cms_page_category_fields');
