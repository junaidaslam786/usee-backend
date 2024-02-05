import { DataTypes, Model } from 'sequelize';

export default function (sequelize) {
  class AgentTimeSlot extends Model {
    static associate(models) {
      AgentTimeSlot.hasMany(models.agentAvailability, { foreignKey: 'timeSlotId' });
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

  // eslint-disable-next-line no-unused-vars
  AgentTimeSlot.addHook('beforeSave', async (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  AgentTimeSlot.addHook('afterCreate', (instance) => {
    //
  });

  // eslint-disable-next-line no-unused-vars
  AgentTimeSlot.addHook('afterDestroy', (instance) => {
    //
  });

  return AgentTimeSlot;
}
