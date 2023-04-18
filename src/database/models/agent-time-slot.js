import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AgentTimeSlot extends Model {
    static associate(models) {
      AgentTimeSlot.hasMany(models.agentAvailability, { foreignKey: 'timeSlotId' })
    }
  }

  AgentTimeSlot.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      unique: true,
      allowNull: false,
      autoIncrement: true,
    },
    fromTime: {
        type: DataTypes.TIME,
    },
    toTime: {
        type: DataTypes.TIME,
    },
    textShow: {
        type: DataTypes.STRING,
    },
  }, {
    modelName: 'agentTimeSlot',
    tableName: 'agent_time_slots',
    sequelize,
  });

  AgentTimeSlot.addHook('beforeSave', async (instance) => {
    //
  });

  AgentTimeSlot.addHook('afterCreate', (instance) => {
    //
  });

  AgentTimeSlot.addHook('afterDestroy', (instance) => {
    //
  });

  return AgentTimeSlot;
}
