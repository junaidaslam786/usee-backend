export const up = (queryInterface, Sequelize) => queryInterface.createTable('users', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4
  },
  firstName: {
    type:Sequelize.STRING,
    field: 'first_name',
    allowNull: false
  },
  lastName: {
    type:Sequelize.STRING,
    field: 'last_name'
  },
  phoneNumber: {
    type:Sequelize.STRING,
    field: 'phone_number'
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: Sequelize.BOOLEAN,
  rememberToken: {
    type:Sequelize.STRING,
    field: 'remember_token'
  },
  rememberTokenExpire: {
    type:Sequelize.DATE,
    field: 'remember_token_expire'
  },
  userType: {
    field: 'user_type',
    type: Sequelize.ENUM,
    defaultValue: "agent",
    values: ["admin", "agent", "customer"]
  },
  profileImage:{
    type:Sequelize.STRING,
    field: 'profile_image'
  },
  roleId: {
    field: 'role_id',
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  cityId: {
    field: 'city_id',
    allowNull: true,
    type: Sequelize.INTEGER,
    onDelete: 'CASCADE',
    references: {
      model: 'cities',
      key: 'id'
    }
  },
  createdBy: {
    allowNull: true,
    type:Sequelize.UUID,
    field: 'created_by'
  },
  updatedBy: {
    allowNull: true,
    type:Sequelize.UUID,
    field: 'updated_by'
  },
  createdAt: {
    type: Sequelize.DATE,
    field: 'created_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  updatedAt: {
    type: Sequelize.DATE,
    field: 'updated_at',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
  deletedAt: {
    allowNull: true,
    type: Sequelize.DATE,
    field: 'deleted_at',
    defaultValue: null
  }
});

export const down = (queryInterface) => queryInterface.dropTable('users');
