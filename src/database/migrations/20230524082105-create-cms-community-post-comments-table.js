export const up = (queryInterface, Sequelize) => queryInterface.createTable('cms_community_post_comments', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
  },
  communityPostId: {
    field: 'community_post_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'cms_community_posts',
      key: 'id',
    },
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
  comment: {
    type: Sequelize.TEXT,
    field: 'comment',
    allowNull: false,
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

export const down = (queryInterface) => queryInterface.dropTable('cms_community_post_comments');
