export const up = (queryInterface, Sequelize) => queryInterface.createTable('products', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4,
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
    allowNull: false,
  },
  description: {
    type: Sequelize.TEXT,
    field: 'description',
  },
  price: {
    type: Sequelize.STRING,
    field: 'price',
  },
  featuredImage: {
    type: Sequelize.STRING,
    field: 'featured_image',
  },
  virtualTourType: {
    field: 'virtual_tour_type',
    type: Sequelize.ENUM,
    defaultValue: 'video',
    values: ['video', 'url', 'slideshow'],
  },
  virtualTourUrl: {
    type: Sequelize.STRING,
    field: 'virtual_tour_url',
  },
  address: {
    type: Sequelize.TEXT,
    field: 'address',
  },
  city: {
    type: Sequelize.STRING,
    field: 'city',
  },
  postalCode: {
    type: Sequelize.STRING,
    field: 'postal_code',
  },
  region: {
    type: Sequelize.STRING,
    field: 'region',
  },
  latitude: {
    type: Sequelize.STRING,
    field: 'latitude',
  },
  longitude: {
    type: Sequelize.STRING,
    field: 'longitude',
  },
  status: {
    field: 'status',
    type: Sequelize.STRING,
    defaultValue: 'active',
  },
  apiCode: {
    type: Sequelize.STRING,
    field: 'api_code',
  },
  createdBy: {
    allowNull: true,
    type: Sequelize.UUID,
    field: 'created_by',
  },
  updatedBy: {
    allowNull: true,
    type: Sequelize.UUID,
    field: 'updated_by',
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

export const down = (queryInterface) => queryInterface.dropTable('products');
