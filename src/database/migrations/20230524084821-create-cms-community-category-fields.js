export const up = (queryInterface, Sequelize) => queryInterface.createTable('cms_community_category_fields', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
  },
  communityId: {
    field: 'community_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'cms_community',
      key: 'id',
    },
  },
  key: {
    field: 'key',
    type: Sequelize.INTEGER,
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

export const down = (queryInterface) => queryInterface.dropTable('cms_community_category_fields');
