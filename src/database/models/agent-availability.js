import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AgentAvailability extends Model {
    static associate(models) {
        AgentAvailability.belongsTo(models.user, { foreignKey: 'userId' })
        AgentAvailability.belongsTo(models.agentTimeSlot, { foreignKey: 'timeSlotId' })
    }
  }

  AgentAvailability.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    dayId: {
        type: DataTypes.INTEGER,
    },
    status: {
        type: DataTypes.BOOLEAN,
    },
  }, {
    modelName: 'agentAvailability',
    tableName: 'agent_availability',
    sequelize,
  });

  AgentAvailability.addHook('beforeSave', async (instance) => {
    //
  });

  AgentAvailability.addHook('afterCreate', (instance) => {
    //
  });

  AgentAvailability.addHook('afterDestroy', (instance) => {
    //
  });

  return AgentAvailability;
}
