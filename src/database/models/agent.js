import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class Agent extends Model {
    static associate(models) {
      Agent.belongsTo(models.user, { foreignKey: 'userId' })
    }
  }

  Agent.init({
    id: {
        type: DataTypes.UUID,
        field: "id",
        primaryKey: true,
        unique: true,
        defaultValue: DataTypes.UUIDV4
    },
    agentId: {
        allowNull: true,
        type: DataTypes.UUID,
        field: "agent_id",
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
    },
    managerId: {
        allowNull: true,
        type: DataTypes.UUID,
        field: "manager_id",
        references: {
          model: "users",
          key: "id"
        },
        onUpdate: "CASCADE",
    },
    agentType: {
        type: DataTypes.STRING,
        enum: ["agent", "manager", "staff"]
    },
    companyName: {
        type: DataTypes.STRING,
    },
    companyLogo:{
        type: DataTypes.STRING,
    },
    companyAddress:{
        type: DataTypes.TEXT,
    },
    companyPosition: {
        type: DataTypes.STRING,
    },
    mobileNumber: {
        type: DataTypes.STRING,
    },
    zipCode: {
        type: DataTypes.STRING,
    },
    mortgageAdvisorEmail: {
        type: DataTypes.STRING,
    },
    apiCode: {
        type: DataTypes.STRING,
    },
    createdBy: {
        type: DataTypes.UUID,
        field: "created_by",
    },
    updatedBy: {
        type: DataTypes.UUID,
        field: "updated_by",
    },
  }, {
    modelName: 'agent',
    tableName: 'agents',
    sequelize,
  });

  Agent.addHook('beforeSave', async (instance) => {
    //
  });

  Agent.addHook('afterCreate', (instance) => {
    //
  });

  Agent.addHook('afterDestroy', (instance) => {
    //
  });

  return Agent;
}
