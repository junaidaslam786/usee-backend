export const up = (queryInterface, Sequelize) => queryInterface.createTable('cms_pages', {
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
    type: Sequelize.STRING,
    field: 'title',
  },
  description: {
    type: Sequelize.TEXT,
    field: 'description',
  },
  featuredImageFile: {
    type: Sequelize.STRING,
    field: 'featured_image',
  },
  file: {
    type: Sequelize.STRING,
    field: 'file',
  },
  status: {
    type: Sequelize.STRING,
    field: 'status',
  },
  pageType: {
    type: Sequelize.STRING,
    field: 'page_type',
  },
  slug: {
    type: Sequelize.STRING,
    field: 'slug',
  },
  createdBy: {
    type: Sequelize.STRING,
    field: 'created_by',
    onDelete: 'CASCADE',
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

export const down = (queryInterface) => queryInterface.dropTable('cms_pages');
