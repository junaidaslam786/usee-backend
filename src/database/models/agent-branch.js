import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AgentBranch extends Model {
    static associate(models) {
      AgentBranch.belongsTo(models.user, { foreignKey: 'userId' });
      AgentBranch.hasMany(models.agent, { foreignKey: 'branchId' });
    }
  }

  AgentBranch.init({
    id: {
      type: DataTypes.UUID,
      field: 'id',
      primaryKey: true,
      unique: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    modelName: 'agentBranch',
    tableName: 'agent_branches',
    sequelize,
  });

  AgentBranch.addHook('beforeSave', async (instance) => {
    //
  });

  AgentBranch.addHook('afterCreate', (instance) => {
    //
  });

  AgentBranch.addHook('afterDestroy', (instance) => {
    //
  });

  return AgentBranch;
}
