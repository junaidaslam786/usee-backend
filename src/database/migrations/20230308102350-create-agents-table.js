export const up = (queryInterface, Sequelize) => queryInterface.createTable('agents', {
  id: {
    type: Sequelize.UUID,
    field: 'id',
    primaryKey: true,
    unique: true,
    defaultValue: Sequelize.UUIDV4
  },
  userId: {
    field: 'user_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  agentId: { // id of the agent who created this agent as manager
    field: 'agent_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  managerId: { // id of the manager who created this agent as staff
    field: 'manager_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  agentType: {
    field: 'agent_type',
    type: Sequelize.ENUM,
    defaultValue: "agent",
    values: ["agent", "manager", "staff"]
  },
  companyName: {
    type:Sequelize.STRING,
    field: 'company_name'
  },
  companyLogo:{
    type: Sequelize.STRING,
    field: 'company_logo'
  },
  companyAddress:{
    type: Sequelize.TEXT,
    field: 'company_address'
  },
  companyPosition: {
    type:Sequelize.STRING,
    field: 'company_position'
  },
  mobileNumber: {
    type:Sequelize.STRING,
    field: 'mobile_number'
  },
  zipCode: {
    type:Sequelize.STRING,
    field: 'zip_code'
  },
  mortgageAdvisorEmail: {
    type: Sequelize.STRING,
    allowNull: true,
    field: 'mortgage_advisor_email'
  },
  branchId: {
    field: 'branch_id',
    type: Sequelize.UUID,
    onDelete: 'CASCADE',
    references: {
      model: 'agent_branches',
      key: 'id'
    }
  },
  apiCode: {
    type:Sequelize.STRING,
    field: 'api_code'
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

export const down = (queryInterface) => queryInterface.dropTable('agents');
