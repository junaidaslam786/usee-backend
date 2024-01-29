import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AgentAccessLevel extends Model {
    static associate(models) {
      AgentAccessLevel.belongsTo(models.user, { foreignKey: 'userId' });
    }
  }

  AgentAccessLevel.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    accessLevel: {
      type: DataTypes.STRING,
    },
  }, {
    modelName: 'agentAccessLevel',
    tableName: 'agent_access_levels',
    sequelize,
    updatedAt: false,
  });

  // eslint-disable-next-line no-unused-vars
  AgentAccessLevel.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  AgentAccessLevel.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  AgentAccessLevel.addHook('afterDestroy', (instance) => {
    //
  });

  return AgentAccessLevel;
}
