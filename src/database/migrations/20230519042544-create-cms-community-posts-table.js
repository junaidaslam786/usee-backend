export const up = (queryInterface, Sequelize) => queryInterface.createTable('cms_community_posts', {
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
  title: {
    type: Sequelize.TEXT,
    field: 'title',
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    field: 'name',
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING,
    field: 'email',
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING,
    field: 'status',
    defaultValue: true,
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

export const down = (queryInterface) => queryInterface.dropTable('cms_community_posts');
